"use client";

import { useState, useCallback, useReducer, useEffect } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Copy,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Globe,
  Share2,
  Edit,
  X,
  Check,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";
import { authClient } from "../../../auth-client";

// Portfolio state management
interface PortfolioSection {
  id: string;
  type: string;
  title: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
}

interface Portfolio {
  id?: string;
  name: string;
  sections: PortfolioSection[];
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  isPublished: boolean;
  publishedUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PortfolioState {
  portfolio: Portfolio;
  history: Portfolio[];
  historyIndex: number;
  isSaving: boolean;
  isPublishing: boolean;
  isLoading: boolean; // Added loading state
  lastSaved?: Date;
  editingSection?: string;
}

type PortfolioAction =
  | { type: "LOAD_PORTFOLIO"; payload: Portfolio }
  | { type: "UPDATE_PORTFOLIO"; payload: Partial<Portfolio> }
  | { type: "ADD_SECTION"; payload: PortfolioSection }
  | {
      type: "UPDATE_SECTION";
      payload: { id: string; updates: Partial<PortfolioSection> };
    }
  | { type: "DELETE_SECTION"; payload: string }
  | { type: "REORDER_SECTIONS"; payload: PortfolioSection[] }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_PUBLISHING"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean } // Added loading action
  | { type: "SET_EDITING_SECTION"; payload: string | undefined }
  | { type: "SAVE_SUCCESS" }
  | { type: "UNDO" }
  | { type: "REDO" };

const portfolioReducer = (
  state: PortfolioState,
  action: PortfolioAction
): PortfolioState => {
  switch (action.type) {
    case "LOAD_PORTFOLIO":
      return {
        ...state,
        portfolio: action.payload,
        history: [action.payload],
        historyIndex: 0,
        isLoading: false,
      };

    case "UPDATE_PORTFOLIO": {
      const updatedPortfolio = { ...state.portfolio, ...action.payload };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length,
      };
    }

    case "ADD_SECTION": {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: [...(state.portfolio.sections || []), action.payload], // Null check for sections
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length,
      };
    }

    case "UPDATE_SECTION": {
      const updatedSections = (state.portfolio.sections || []).map((section) =>
        section.id === action.payload.id
          ? { ...section, ...action.payload.updates }
          : section
      );
      const updatedPortfolio = {
        ...state.portfolio,
        sections: updatedSections,
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length,
      };
    }

    case "DELETE_SECTION": {
      const updatedSections = (state.portfolio.sections || [])
        .filter((section) => section.id !== action.payload)
        .map((section, index) => ({ ...section, order: index }));
      const updatedPortfolio = {
        ...state.portfolio,
        sections: updatedSections,
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length,
      };
    }

    case "REORDER_SECTIONS": {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: action.payload.map((section, index) => ({
          ...section,
          order: index,
        })),
      };
      // Only add to history if the order actually changed
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length,
      };
    }

    case "SET_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_PUBLISHING":
      return { ...state, isPublishing: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_EDITING_SECTION":
      return { ...state, editingSection: action.payload };

    case "SAVE_SUCCESS":
      return { ...state, lastSaved: new Date() };

    case "UNDO": {
      if (state.historyIndex > 0) {
        return {
          ...state,
          portfolio: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          portfolio: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    }

    default:
      return state;
  }
};

// Sortable section component
const SortableSection = ({
  section,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}: {
  section: PortfolioSection;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "shadow-lg scale-105" : "hover:shadow-md"
      } ${!section.isVisible ? "opacity-60 border-dashed" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">
                {section.title || "Untitled Section"}
              </h4>
              <Badge variant="outline" className="text-xs">
                {section.type}
              </Badge>
              {!section.isVisible && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Order: {section.order + 1}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
              title="Edit section"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
              title={section.isVisible ? "Hide section" : "Show section"}
            >
              {section.isVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
              title="Duplicate section"
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Section editor component
const SectionEditor = ({
  section,
  onUpdate,
  onClose,
}: {
  section: PortfolioSection;
  onUpdate: (updates: Partial<PortfolioSection>) => void;
  onClose: () => void;
}) => {
  // Use a local state for content and title to allow live editing without dispatching
  // to the global state on every keystroke, improving performance for inputs.
  // Changes are dispatched only on save.
  const [localContent, setLocalContent] = useState(section.content);
  const [localTitle, setLocalTitle] = useState(section.title);

  useEffect(() => {
    // Reset local state when the section prop changes (i.e., a different section is selected)
    setLocalContent(section.content);
    setLocalTitle(section.title);
  }, [section]);

  const handleSave = () => {
    onUpdate({
      content: localContent,
      title: localTitle,
    });
    onClose();
  };

  const updateContent = useCallback((key: string, value: any) => {
    setLocalContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addArrayItem = useCallback(
    (key: string, item: any) => {
      const currentArray = localContent[key] || [];
      setLocalContent((prev) => ({
        ...prev,
        [key]: [...currentArray, item],
      }));
    },
    [localContent]
  );

  const removeArrayItem = useCallback(
    (key: string, index: number) => {
      const currentArray = localContent[key] || [];
      setLocalContent((prev) => ({
        ...prev,
        [key]: currentArray.filter((_: any, i: number) => i !== index),
      }));
    },
    [localContent]
  );

  const updateArrayItem = useCallback(
    (key: string, index: number, updates: any) => {
      const currentArray = localContent[key] || [];
      setLocalContent((prev) => ({
        ...prev,
        [key]: currentArray.map((item: any, i: number) =>
          i === index ? { ...item, ...updates } : item
        ),
      }));
    },
    [localContent]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit {section.type} Section</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          title="Close editor"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="section-title">Section Title</Label>
          <Input
            id="section-title"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Enter section title"
          />
        </div>

        {section.type === "hero" && (
          <>
            <div>
              <Label htmlFor="hero-name">Name</Label>
              <Input
                id="hero-name"
                value={localContent.name || ""}
                onChange={(e) => updateContent("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={localContent.title || ""}
                onChange={(e) => updateContent("title", e.target.value)}
                placeholder="Your professional title"
              />
            </div>
            <div>
              <Label htmlFor="hero-description">Description</Label>
              <Textarea
                id="hero-description"
                value={localContent.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                placeholder="Brief description about yourself"
                rows={4}
              />
            </div>
          </>
        )}

        {section.type === "about" && (
          <>
            <div>
              <Label htmlFor="about-content">About Content</Label>
              <Textarea
                id="about-content"
                value={localContent.content || ""}
                onChange={(e) => updateContent("content", e.target.value)}
                placeholder="Tell your story..."
                rows={8}
              />
            </div>
          </>
        )}

        {section.type === "skills" && (
          <div>
            <Label>Skills</Label>
            <div className="space-y-2">
              {(localContent.skills || []).map(
                (skill: string, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={skill}
                      onChange={(e) =>
                        updateArrayItem("skills", index, e.target.value)
                      }
                      placeholder="Skill name"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("skills", index)}
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              )}
              <Button
                variant="outline"
                onClick={() => addArrayItem("skills", "")}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        )}

        {section.type === "projects" && (
          <div>
            <Label>Projects</Label>
            <div className="space-y-4">
              {(localContent.projects || []).map(
                (project: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("projects", index)}
                          title="Remove project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <Label htmlFor={`project-${index}-title`}>Title</Label>
                        <Input
                          id={`project-${index}-title`}
                          value={project.title || ""}
                          onChange={(e) =>
                            updateArrayItem("projects", index, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Project title"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`project-${index}-description`}>
                          Description
                        </Label>
                        <Textarea
                          id={`project-${index}-description`}
                          value={project.description || ""}
                          onChange={(e) =>
                            updateArrayItem("projects", index, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Project description"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Links</Label>
                        <div className="space-y-2">
                          {(project.links || []).map(
                            (link: any, linkIndex: number) => (
                              <div
                                key={linkIndex}
                                className="flex gap-2 items-center"
                              >
                                <Input
                                  value={link.label || ""}
                                  onChange={(e) => {
                                    const newLinks = [...(project.links || [])];
                                    newLinks[linkIndex] = {
                                      ...link,
                                      label: e.target.value,
                                    };
                                    updateArrayItem("projects", index, {
                                      links: newLinks,
                                    });
                                  }}
                                  placeholder="Link label (e.g., Live Demo)"
                                />
                                <Input
                                  value={link.url || ""}
                                  onChange={(e) => {
                                    const newLinks = [...(project.links || [])];
                                    newLinks[linkIndex] = {
                                      ...link,
                                      url: e.target.value,
                                    };
                                    updateArrayItem("projects", index, {
                                      links: newLinks,
                                    });
                                  }}
                                  placeholder="URL (e.g., https://example.com)"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newLinks = (
                                      project.links || []
                                    ).filter(
                                      (_: any, i: number) => i !== linkIndex
                                    );
                                    updateArrayItem("projects", index, {
                                      links: newLinks,
                                    });
                                  }}
                                  title="Remove link"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newLinks = [
                                ...(project.links || []),
                                { label: "", url: "" },
                              ];
                              updateArrayItem("projects", index, {
                                links: newLinks,
                              });
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Link
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Tags (e.g., React, Node.js)</Label>
                        <div className="space-y-2">
                          {(project.tags || []).map(
                            (tag: string, tagIndex: number) => (
                              <div
                                key={tagIndex}
                                className="flex gap-2 items-center"
                              >
                                <Input
                                  value={tag}
                                  onChange={(e) => {
                                    const newTags = [...(project.tags || [])];
                                    newTags[tagIndex] = e.target.value;
                                    updateArrayItem("projects", index, {
                                      tags: newTags,
                                    });
                                  }}
                                  placeholder="Tag name"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newTags = (project.tags || []).filter(
                                      (_: string, i: number) => i !== tagIndex
                                    );
                                    updateArrayItem("projects", index, {
                                      tags: newTags,
                                    });
                                  }}
                                  title="Remove tag"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTags = [...(project.tags || []), ""];
                              updateArrayItem("projects", index, {
                                tags: newTags,
                              });
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Tag
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              )}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("projects", {
                    title: "",
                    description: "",
                    links: [],
                    tags: [],
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        )}

        {section.type === "contact" && (
          <>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={localContent.email || ""}
                onChange={(e) => updateContent("email", e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={localContent.phone || ""}
                onChange={(e) => updateContent("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Call to Action Message</Label>
              <Textarea
                id="contact-message"
                value={localContent.message || ""}
                onChange={(e) => updateContent("message", e.target.value)}
                placeholder="Let's connect! Feel free to reach out..."
                rows={4}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Preview section component
const PreviewSection = ({
  section,
  theme,
  onEdit,
}: {
  section: PortfolioSection;
  theme: any;
  onEdit: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!section.isVisible) return null;

  // Fallback for theme values in case they are undefined
  const primaryColor = theme?.primary || "#3b82f6";
  const secondaryColor = theme?.secondary || "#64748b";
  const backgroundColor = theme?.background || "#ffffff";
  const textColor = theme?.text || "#1e293b";

  return (
    <div
      className="relative group cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        padding: "2rem",
        marginBottom: "1rem",
        borderRadius: "8px",
        border: isHovered
          ? `2px solid ${primaryColor}`
          : "2px solid transparent",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEdit}
    >
      {isHovered && (
        <div className="absolute top-2 right-2 z-10">
          <Button size="sm" variant="secondary" className="shadow-md">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
        {section.title || `Untitled ${section.type} Section`}
      </h2>

      {section.type === "hero" && (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {section.content?.name || "Your Name"}
          </h1>
          <h2 className="text-2xl">{section.content?.title || "Your Title"}</h2>
          <p className="text-lg">
            {section.content?.description ||
              "A brief description about yourself and what you do."}
          </p>
        </div>
      )}

      {section.type === "about" && (
        <div>
          <p className="text-lg leading-relaxed">
            {section.content?.content ||
              "This is where you can write a compelling story about yourself, your journey, and your passions. Make it engaging!"}
          </p>
        </div>
      )}

      {section.type === "skills" && (
        <div className="flex flex-wrap gap-2">
          {(section.content?.skills || []).length > 0 ? (
            (section.content.skills || []).map(
              (skill: string, index: number) => (
                <Badge
                  key={index}
                  style={{ backgroundColor: primaryColor, color: "white" }}
                  className="text-base px-3 py-1 rounded-full"
                >
                  {skill}
                </Badge>
              )
            )
          ) : (
            <p className="text-muted-foreground italic">No skills added yet.</p>
          )}
        </div>
      )}

      {section.type === "projects" && (
        <div className="grid gap-6 md:grid-cols-2">
          {(section.content?.projects || []).length > 0 ? (
            (section.content.projects || []).map(
              (project: any, index: number) => (
                <Card
                  key={index}
                  className="p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {project.title || "Project Title"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description ||
                      "A brief description of your project and its key features."}
                  </p>

                  {project.links && project.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.links.map((link: any, linkIndex: number) => (
                        <Button
                          key={linkIndex}
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.label || "Link"}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag: string, tagIndex: number) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              )
            )
          ) : (
            <p className="text-muted-foreground italic col-span-full">
              No projects added yet.
            </p>
          )}
        </div>
      )}

      {section.type === "contact" && (
        <div className="space-y-4">
          <p>
            <span className="font-medium" style={{ color: primaryColor }}>
              Email:
            </span>{" "}
            {section.content?.email || "your.email@example.com"}
          </p>
          <p>
            <span className="font-medium" style={{ color: primaryColor }}>
              Phone:
            </span>{" "}
            {section.content?.phone || "+1 (555) 123-4567"}
          </p>
          <p className="text-muted-foreground italic">
            {section.content?.message ||
              "Feel free to reach out to discuss collaborations or opportunities!"}
          </p>
        </div>
      )}
    </div>
  );
};

// Main builder component
export const UnifiedPortfolioBuilder = () => {
  const { data: session } = authClient.useSession(); // This seems unused in the provided code
  const [selectedDevice, setSelectedDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  // Initialize portfolio state
  const initialPortfolio: Portfolio = {
    name: "My Awesome Portfolio",
    sections: [],
    theme: {
      primary: "#3b82f6", // Tailwind blue-500
      secondary: "#64748b", // Tailwind slate-500
      background: "#ffffff",
      text: "#1e293b", // Tailwind slate-900
    },
    isPublished: false,
  };

  const [state, dispatch] = useReducer(portfolioReducer, {
    portfolio: initialPortfolio,
    history: [initialPortfolio],
    historyIndex: 0,
    isSaving: false,
    isPublishing: false,
    isLoading: true, // Set to true initially
    editingSection: undefined,
  });

  // Auto-save functionality
  useEffect(() => {
    // Only auto-save if there's a portfolio ID and changes have been made
    if (
      state.portfolio.id &&
      state.historyIndex === state.history.length - 1 &&
      !state.isSaving
    ) {
      const saveTimer = setTimeout(() => {
        handleSave();
      }, 2000); // Save 2 seconds after last change

      return () => clearTimeout(saveTimer);
    }
  }, [state.portfolio, state.historyIndex]); // Depend on portfolio and historyIndex for changes

  // Load portfolio on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    const initializePortfolio = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      if (editId) {
        await loadPortfolio(editId);
      } else {
        await createNewPortfolio();
      }
      dispatch({ type: "SET_LOADING", payload: false });
    };

    initializePortfolio();
  }, []);

  const createNewPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: initialPortfolio.name,
          slug: `portfolio-${Date.now()}`, // Generate unique slug
          sections: [],
          globalSettings: {
            theme: initialPortfolio.theme,
            seo: {
              title: initialPortfolio.name,
              description: "",
              keywords: [],
            },
            domain: { subdomain: `portfolio-${Date.now()}` },
            analytics: { trackingEnabled: false },
          },
        }),
      });

      if (response.ok) {
        const portfolio = await response.json();
        dispatch({ type: "LOAD_PORTFOLIO", payload: portfolio });
        toast.success("New portfolio created!");
      } else {
        throw new Error("Failed to create new portfolio");
      }
    } catch (error) {
      console.error("Failed to create portfolio:", error);
      toast.error("Failed to create portfolio");
    }
  };

  const loadPortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios?id=${id}`);
      if (response.ok) {
        const portfolio = await response.json();
        dispatch({ type: "LOAD_PORTFOLIO", payload: portfolio });
        toast.success("Portfolio loaded successfully!");
      } else {
        throw new Error("Failed to load portfolio");
      }
    } catch (error) {
      console.error("Failed to load portfolio:", error);
      toast.error("Failed to load portfolio");
    }
  };

  const handleSave = useCallback(async () => {
    if (!state.portfolio.id) {
      toast.info(
        "No portfolio to save. Create a new one or load an existing one."
      );
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      const response = await fetch("/api/portfolios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.portfolio),
      });

      if (response.ok) {
        dispatch({ type: "SAVE_SUCCESS" });
        toast.success("Portfolio saved!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save portfolio: ${(error as Error).message}`);
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.portfolio]); // Dependency array includes state.portfolio

  const handlePublish = useCallback(async () => {
    if (!state.portfolio.id) {
      toast.error("Please save your portfolio first before publishing.");
      return;
    }
    if (!state.portfolio.name || state.portfolio.sections?.length === 0) {
      toast.error(
        "Portfolio must have a name and at least one section to publish."
      );
      return;
    }

    dispatch({ type: "SET_PUBLISHING", payload: true });

    try {
      // Assuming the slug is derived from the name or can be set in globalSettings
      const slug =
        state.portfolio.name.toLowerCase().replace(/\s+/g, "-") +
        (state.portfolio.id ? `-${state.portfolio.id.slice(0, 4)}` : ""); // Append part of ID for uniqueness

      const response = await fetch("/api/portfolios/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId: state.portfolio.id,
          customSlug: slug,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({
          type: "UPDATE_PORTFOLIO",
          payload: {
            isPublished: true,
            publishedUrl: result.portfolioUrl,
          },
        });
        toast.success(
          <p>
            Portfolio published!{" "}
            <a
              href={result.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              View Live Site
            </a>
          </p>
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Publish failed");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(`Failed to publish portfolio: ${(error as Error).message}`);
    } finally {
      dispatch({ type: "SET_PUBLISHING", payload: false });
    }
  }, [state.portfolio]);

  const addSection = useCallback(
    (type: string) => {
      const newSection: PortfolioSection = {
        id: `section-${Date.now()}`,
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: {},
        isVisible: true,
        order: state.portfolio.sections?.length || 0, // Use optional chaining and default to 0
      };

      dispatch({ type: "ADD_SECTION", payload: newSection });
      toast.success(`Added ${type} section`);
    },
    [state.portfolio.sections?.length]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const currentSections = state.portfolio.sections || []; // Null check
      const oldIndex = currentSections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = currentSections.findIndex(
        (section) => section.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(currentSections, oldIndex, newIndex);
        dispatch({ type: "REORDER_SECTIONS", payload: newSections });
      }
    },
    [state.portfolio.sections]
  );

  const editingSection = state.portfolio.sections?.find(
    (s) => s.id === state.editingSection
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top toolbar */}
      <div className="border-b border-border p-4 shadow-sm z-10 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <Badge
              variant={state.portfolio.isPublished ? "default" : "secondary"}
              className={`px-3 py-1 ${
                state.portfolio.isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {state.portfolio.isPublished ? "Published" : "Draft"}
            </Badge>
            {state.portfolio.name && (
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                "{state.portfolio.name}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Device preview */}
            <div className="flex rounded-lg border p-1 bg-muted">
              {[
                { id: "desktop", icon: Monitor, label: "Desktop" },
                { id: "tablet", icon: Tablet, label: "Tablet" },
                { id: "mobile", icon: Smartphone, label: "Mobile" },
              ].map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={selectedDevice === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice(id as any)}
                  className="h-8 w-8 p-0"
                  title={`View on ${label}`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Undo / Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={state.historyIndex === 0}
              title="Undo last change"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "REDO" })}
              disabled={state.historyIndex === state.history.length - 1}
              title="Redo change"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={
                state.isSaving ||
                state.isLoading ||
                !state.portfolio.id ||
                state.historyIndex === state.history.length - 1
              }
              variant="outline"
            >
              {state.isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {state.isSaving ? "Saving..." : "Save"}
            </Button>

            {/* Publish button */}
            <Button
              onClick={handlePublish}
              disabled={
                state.isPublishing ||
                state.isLoading ||
                !state.portfolio.id ||
                (state.portfolio.sections || []).length === 0
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {state.isPublishing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : state.portfolio.isPublished ? (
                <Share2 className="w-4 h-4 mr-2" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              {state.isPublishing
                ? "Publishing..."
                : state.portfolio.isPublished
                ? "Update Live"
                : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Sections */}
        <div className="w-80 border-r border-border bg-muted/30 p-4 overflow-y-auto shrink-0">
          {state.isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading portfolio...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Portfolio Sections</h3>
                <Badge variant="outline" className="px-3 py-1">
                  {state.portfolio.sections?.length || 0} sections
                </Badge>
              </div>

              {/* Add section buttons */}
              <div className="grid grid-cols-2 gap-2">
                {["hero", "about", "skills", "projects", "contact"].map(
                  (type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addSection(type)}
                      className="capitalize"
                      // disabled={!state.portfolio.id}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {type}
                    </Button>
                  )
                )}
              </div>

              {/* Sections list */}
              <DndContext
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
              >
                <SortableContext
                  items={state.portfolio.sections?.map((s) => s.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(state.portfolio.sections || []).length > 0 ? (
                      state.portfolio.sections
                        .sort((a, b) => a.order - b.order) // Ensure sections are sorted by order
                        .map((section) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            onEdit={() =>
                              dispatch({
                                type: "SET_EDITING_SECTION",
                                payload: section.id,
                              })
                            }
                            onToggleVisibility={() =>
                              dispatch({
                                type: "UPDATE_SECTION",
                                payload: {
                                  id: section.id,
                                  updates: { isVisible: !section.isVisible },
                                },
                              })
                            }
                            onDuplicate={() => {
                              const duplicated = {
                                ...section,
                                id: `section-${Date.now()}`,
                                // Insert duplicated section right after the original or at the end
                                order: section.order + 0.5, // Temporarily give it a fractional order
                              };
                              const newSections = [
                                ...(state.portfolio.sections || []),
                                duplicated,
                              ]
                                .sort((a, b) => a.order - b.order)
                                .map((s, idx) => ({ ...s, order: idx })); // Re-index all sections
                              dispatch({
                                type: "REORDER_SECTIONS",
                                payload: newSections,
                              });
                              toast.info(`Duplicated "${section.title}"`);
                            }}
                            onDelete={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete the "${section.title}" section?`
                                )
                              ) {
                                dispatch({
                                  type: "DELETE_SECTION",
                                  payload: section.id,
                                });
                                toast.success(
                                  `Deleted ${section.title} section`
                                );
                              }
                            }}
                          />
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No sections added yet</p>
                        <p className="text-sm">
                          Add sections to start building your portfolio.
                        </p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Center - Preview */}
        <div className="flex-1 bg-muted/10 overflow-auto p-4 md:p-8 flex justify-center items-start">
          {state.isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Preparing preview...</p>
            </div>
          ) : (
            <div
              className={`bg-white shadow-xl transition-all duration-300 border border-border overflow-hidden
                ${
                  selectedDevice === "mobile"
                    ? "w-[375px] min-h-[667px] max-h-[812px] rounded-2xl"
                    : ""
                }
                ${
                  selectedDevice === "tablet"
                    ? "w-[768px] min-h-[1024px] max-h-[1024px] rounded-lg"
                    : ""
                }
                ${
                  selectedDevice === "desktop"
                    ? "w-full max-w-6xl min-h-[800px] rounded-md"
                    : ""
                }
              `}
              style={{
                backgroundColor: state.portfolio.theme?.background || "#ffffff", // Null check for theme
                color: state.portfolio.theme?.text || "#1e293b", // Null check for theme
              }}
            >
              {state.portfolio.sections &&
              state.portfolio.sections.length > 0 ? (
                <div className="min-h-full">
                  {state.portfolio.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <PreviewSection
                        key={section.id}
                        section={section}
                        theme={state.portfolio.theme}
                        onEdit={() =>
                          dispatch({
                            type: "SET_EDITING_SECTION",
                            payload: section.id,
                          })
                        }
                      />
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center text-muted-foreground p-4">
                    <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Your Portfolio Awaits!
                    </h3>
                    <p>
                      Add sections from the left sidebar to start building your
                      professional portfolio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar - Section editor or theme controls */}
        <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto shrink-0">
          {editingSection ? (
            <SectionEditor
              key={editingSection.id} // Key to force remount when editing a different section
              section={editingSection}
              onUpdate={(updates) =>
                dispatch({
                  type: "UPDATE_SECTION",
                  payload: { id: editingSection.id, updates },
                })
              }
              onClose={() =>
                dispatch({ type: "SET_EDITING_SECTION", payload: undefined })
              }
            />
          ) : (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Global Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="portfolio-name">Portfolio Name</Label>
                  <Input
                    id="portfolio-name"
                    value={state.portfolio.name}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_PORTFOLIO",
                        payload: { name: e.target.value },
                      })
                    }
                    placeholder="My Portfolio"
                    disabled={state.isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={state.portfolio.theme?.primary || "#3b82f6"} // Null check and default
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PORTFOLIO",
                          payload: {
                            theme: {
                              ...(state.portfolio.theme ||
                                initialPortfolio.theme), // Null check for theme
                              primary: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={state.isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={state.portfolio.theme?.secondary || "#64748b"} // Null check and default
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PORTFOLIO",
                          payload: {
                            theme: {
                              ...(state.portfolio.theme ||
                                initialPortfolio.theme), // Null check for theme
                              secondary: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={state.isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <Input
                      id="background-color"
                      type="color"
                      value={state.portfolio.theme?.background || "#ffffff"}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PORTFOLIO",
                          payload: {
                            theme: {
                              ...(state.portfolio.theme ||
                                initialPortfolio.theme),
                              background: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={state.isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={state.portfolio.theme?.text || "#1e293b"}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PORTFOLIO",
                          payload: {
                            theme: {
                              ...(state.portfolio.theme ||
                                initialPortfolio.theme),
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      disabled={state.isLoading}
                    />
                  </div>
                </div>
              </div>

              {state.lastSaved && (
                <div className="text-sm text-muted-foreground text-center pt-4 border-t border-dashed">
                  Last saved: {state.lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
