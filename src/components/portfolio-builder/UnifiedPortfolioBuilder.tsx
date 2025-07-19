"use client";

import { useState, useCallback, useReducer, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  User,
  Briefcase,
  Code,
  Play,
  Share2,
  Globe,
  ExternalLink,
  X,
  Edit,
  Star,
  CheckCircle,
  Loader2,
  Settings,
  Copy,
  Image,
  Layout,
  Palette,
  GraduationCap,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface PortfolioSection {
  id: string;
  type:
    | "hero"
    | "about"
    | "skills"
    | "projects"
    | "experience"
    | "education"
    | "contact";
  variant: string;
  title: string;
  content: Record<string, any>; // More specific types for content would be ideal
  isVisible: boolean;
  order: number;
}

interface PortfolioData {
  id?: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  profileImage: string;
  website: string;
  linkedin: string;
  github: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  sections: PortfolioSection[];
}

// Define specific types for COMPONENT_LIBRARY variants
type ComponentVariant = {
  id: string;
  name: string;
  description: string;
  preview: string;
  defaultContent: Record<string, any>;
};

type ComponentLibraryType = {
  [key: string]: {
    variants: ComponentVariant[];
  };
};

// Component Library - Multiple variants for each section type
const COMPONENT_LIBRARY: ComponentLibraryType = {
  hero: {
    variants: [
      {
        id: "hero-minimal",
        name: "Minimal Hero",
        description: "Clean, centered layout with essential information",
        preview: "/previews/hero-minimal.jpg",
        defaultContent: {
          name: "",
          title: "",
          subtitle: "",
          profileImage: "",
          backgroundType: "solid",
        },
      },
      {
        id: "hero-split",
        name: "Split Hero",
        description: "Two-column layout with image and content",
        preview: "/previews/hero-split.jpg",
        defaultContent: {
          name: "",
          title: "",
          subtitle: "",
          profileImage: "",
          backgroundType: "gradient",
        },
      },
      {
        id: "hero-creative",
        name: "Creative Hero",
        description: "Bold design with animated elements",
        preview: "/previews/hero-creative.jpg",
        defaultContent: {
          name: "",
          title: "",
          subtitle: "",
          profileImage: "",
          backgroundType: "pattern",
        },
      },
      {
        id: "hero-professional",
        name: "Professional Hero",
        description: "Corporate-style layout with formal presentation",
        preview: "/previews/hero-professional.jpg",
        defaultContent: {
          name: "",
          title: "",
          subtitle: "",
          profileImage: "",
          backgroundType: "image",
        },
      },
      {
        id: "hero-video",
        name: "Video Hero",
        description: "Full-screen video background with overlay text",
        preview: "/previews/hero-video.jpg",
        defaultContent: {
          name: "",
          title: "",
          subtitle: "",
          videoUrl: "",
          backgroundType: "video",
        },
      },
    ],
  },
  about: {
    variants: [
      {
        id: "about-simple",
        name: "Simple About",
        description: "Clean text-based about section",
        preview: "/previews/about-simple.jpg",
        defaultContent: {
          description: "",
          highlights: [],
        },
      },
      {
        id: "about-timeline",
        name: "Timeline About",
        description: "Journey timeline with milestones",
        preview: "/previews/about-timeline.jpg",
        defaultContent: {
          description: "",
          timeline: [],
        },
      },
      {
        id: "about-cards",
        name: "Card-based About",
        description: "Information displayed in cards",
        preview: "/previews/about-cards.jpg",
        defaultContent: {
          description: "",
          cards: [],
        },
      },
      {
        id: "about-split",
        name: "Split About",
        description: "Two-column layout with image and content",
        preview: "/previews/about-split.jpg",
        defaultContent: {
          description: "",
          image: "",
          stats: [],
        },
      },
      {
        id: "about-creative",
        name: "Creative About",
        description: "Artistic layout with visual elements",
        preview: "/previews/about-creative.jpg",
        defaultContent: {
          description: "",
          visualElements: [],
        },
      },
    ],
  },
  skills: {
    variants: [
      {
        id: "skills-grid",
        name: "Skills Grid",
        description: "Grid layout with skill badges",
        preview: "/previews/skills-grid.jpg",
        defaultContent: {
          skills: [],
        },
      },
      {
        id: "skills-progress",
        name: "Progress Bars",
        description: "Skills with progress indicators",
        preview: "/previews/skills-progress.jpg",
        defaultContent: {
          skills: [],
        },
      },
      {
        id: "skills-icons",
        name: "Icon Skills",
        description: "Skills displayed with technology icons",
        preview: "/previews/skills-icons.jpg",
        defaultContent: {
          skills: [],
        },
      },
      {
        id: "skills-categories",
        name: "Categorized Skills",
        description: "Skills organized by categories",
        preview: "/previews/skills-categories.jpg",
        defaultContent: {
          categories: [],
        },
      },
      {
        id: "skills-chart",
        name: "Skills Chart",
        description: "Visual chart representation of skills",
        preview: "/previews/skills-chart.jpg",
        defaultContent: {
          skills: [],
        },
      },
    ],
  },
  projects: {
    variants: [
      {
        id: "projects-grid",
        name: "Project Grid",
        description: "Clean grid layout for projects",
        preview: "/previews/projects-grid.jpg",
        defaultContent: {
          projects: [],
        },
      },
      {
        id: "projects-masonry",
        name: "Masonry Layout",
        description: "Pinterest-style masonry grid",
        preview: "/previews/projects-masonry.jpg",
        defaultContent: {
          projects: [],
        },
      },
      {
        id: "projects-carousel",
        name: "Project Carousel",
        description: "Horizontal scrolling carousel",
        preview: "/previews/projects-carousel.jpg",
        defaultContent: {
          projects: [],
        },
      },
      {
        id: "projects-featured",
        name: "Featured Projects",
        description: "Highlight main projects with detailed cards",
        preview: "/previews/projects-featured.jpg",
        defaultContent: {
          projects: [],
        },
      },
      {
        id: "projects-timeline",
        name: "Project Timeline",
        description: "Chronological project timeline",
        preview: "/previews/projects-timeline.jpg",
        defaultContent: {
          projects: [],
        },
      },
    ],
  },
  experience: {
    variants: [
      {
        id: "experience-timeline",
        name: "Experience Timeline",
        description: "Vertical timeline of work experience",
        preview: "/previews/experience-timeline.jpg",
        defaultContent: {
          experiences: [],
        },
      },
      {
        id: "experience-cards",
        name: "Experience Cards",
        description: "Card-based experience layout",
        preview: "/previews/experience-cards.jpg",
        defaultContent: {
          experiences: [],
        },
      },
      {
        id: "experience-minimal",
        name: "Minimal Experience",
        description: "Clean, text-focused experience list",
        preview: "/previews/experience-minimal.jpg",
        defaultContent: {
          experiences: [],
        },
      },
    ],
  },
  education: {
    variants: [
      {
        id: "education-timeline",
        name: "Education Timeline",
        description: "Chronological education timeline",
        preview: "/previews/education-timeline.jpg",
        defaultContent: {
          education: [],
        },
      },
      {
        id: "education-cards",
        name: "Education Cards",
        description: "Card-based education display",
        preview: "/previews/education-cards.jpg",
        defaultContent: {
          education: [],
        },
      },
    ],
  },
  contact: {
    variants: [
      {
        id: "contact-form",
        name: "Contact Form",
        description: "Full contact form with validation",
        preview: "/previews/contact-form.jpg",
        defaultContent: {
          email: "",
          phone: "",
          location: "",
          showForm: true,
        },
      },
      {
        id: "contact-minimal",
        name: "Minimal Contact",
        description: "Simple contact information display",
        preview: "/previews/contact-minimal.jpg",
        defaultContent: {
          email: "",
          phone: "",
          location: "",
          showForm: false,
        },
      },
      {
        id: "contact-creative",
        name: "Creative Contact",
        description: "Artistic contact section with animations",
        preview: "/previews/contact-creative.jpg",
        defaultContent: {
          email: "",
          phone: "",
          location: "",
          animations: true,
        },
      },
      {
        id: "contact-sidebar",
        name: "Sidebar Contact",
        description: "Side-aligned contact information",
        preview: "/previews/contact-sidebar.jpg",
        defaultContent: {
          email: "",
          phone: "",
          location: "",
          layout: "sidebar",
        },
      },
    ],
  },
};

// Component Selector Modal
const ComponentSelectorModal = ({
  isOpen,
  onClose,
  sectionType,
  onSelectVariant,
}: {
  isOpen: boolean;
  onClose: () => void;
  sectionType: keyof typeof COMPONENT_LIBRARY;
  onSelectVariant: (variant: ComponentVariant) => void; // Improved type
}) => {
  if (!isOpen) return null;

  const variants = COMPONENT_LIBRARY[sectionType]?.variants || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Choose {sectionType} Component
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((variant) => (
              <Card
                key={variant.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  onSelectVariant(variant);
                  onClose();
                }}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    {/* Placeholder for actual preview image */}
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{variant.name}</h3>
                  <p className="text-sm text-gray-600">{variant.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sortable Section Component
const SortableSection = ({
  section,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onDuplicate,
  isEditing,
  onEdit,
}: {
  section: PortfolioSection;
  onUpdate: (id: string, updates: Partial<PortfolioSection>) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  isEditing: string | null;
  onEdit: (id: string) => void;
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

  // Improved: Get icon directly from a map or component library
  const getSectionIcon = (type: PortfolioSection["type"]) => {
    const icons = {
      hero: User,
      about: User, // Can be improved further to distinguish from hero if needed
      skills: Star,
      projects: Code,
      experience: Briefcase,
      education: GraduationCap,
      contact: Mail,
    };
    return icons[type] || Settings; // Fallback to Settings icon
  };

  const Icon = getSectionIcon(section.type);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "shadow-lg" : "hover:shadow-md"
      } ${!section.isVisible ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1">
            <h4 className="font-medium">{section.title}</h4>{" "}
            {/* Uses section.title */}
            <p className="text-sm text-muted-foreground">
              Order: {section.order + 1}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(section.id)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />{" "}
              {/* Changed from Eye to Edit for clarity */}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(section.id)}
              className="h-8 w-8 p-0"
            >
              {section.isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(section.id)}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onDelete(section.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing === section.id && (
        <CardContent className="pt-0">
          <SectionEditor
            section={section}
            onUpdate={(updates) => onUpdate(section.id, updates)}
          />
        </CardContent>
      )}
    </Card>
  );
};

// Section Editor Component
const SectionEditor = ({
  section,
  onUpdate,
}: {
  section: PortfolioSection;
  onUpdate: (updates: Partial<PortfolioSection>) => void;
}) => {
  const handleContentUpdate = useCallback(
    (field: string, value: any) => {
      onUpdate({
        content: {
          ...section.content,
          [field]: value,
        },
      });
    },
    [section.content, onUpdate]
  );

  const handleArrayItemUpdate = useCallback(
    (field: string, index: number, value: any) => {
      const currentArray = section.content[field] || [];
      const newArray = [...currentArray];
      newArray[index] = value;
      handleContentUpdate(field, newArray);
    },
    [section.content, handleContentUpdate]
  );

  const addArrayItem = useCallback(
    (field: string, newItem: any) => {
      const currentArray = section.content[field] || [];
      handleContentUpdate(field, [...currentArray, newItem]);
    },
    [section.content, handleContentUpdate]
  );

  const removeArrayItem = useCallback(
    (field: string, index: number) => {
      const currentArray = section.content[field] || [];
      handleContentUpdate(
        field,
        currentArray.filter((_, i) => i !== index)
      );
    },
    [section.content, handleContentUpdate]
  );

  const getVariantOptions = (type: PortfolioSection["type"]) => {
    return COMPONENT_LIBRARY[type]?.variants || [];
  };

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("hero").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Name</Label>
            <Input
              value={section.content.name || ""}
              onChange={(e) => handleContentUpdate("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Title</Label>
            <Input
              value={section.content.title || ""}
              onChange={(e) => handleContentUpdate("title", e.target.value)}
              placeholder="Your professional title"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Subtitle</Label>
            <Input
              value={section.content.subtitle || ""}
              onChange={(e) => handleContentUpdate("subtitle", e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Profile Image URL</Label>
            <Input
              value={section.content.profileImage || ""}
              onChange={(e) =>
                handleContentUpdate("profileImage", e.target.value)
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {section.variant === "hero-video" && (
            <div>
              <Label className="text-sm font-medium">Video URL</Label>
              <Input
                value={section.content.videoUrl || ""}
                onChange={(e) =>
                  handleContentUpdate("videoUrl", e.target.value)
                }
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Background Type</Label>
            <Select
              value={section.content.backgroundType || "solid"}
              onValueChange={(value) =>
                handleContentUpdate("backgroundType", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="pattern">Pattern</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "about":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("about").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={section.content.description || ""}
              onChange={(e) =>
                handleContentUpdate("description", e.target.value)
              }
              placeholder="Tell us about yourself..."
              className="min-h-24"
            />
          </div>

          {section.variant === "about-split" && (
            <div>
              <Label className="text-sm font-medium">Image URL</Label>
              <Input
                value={section.content.image || ""}
                onChange={(e) => handleContentUpdate("image", e.target.value)}
                placeholder="https://example.com/about-image.jpg"
              />
            </div>
          )}

          {(section.variant === "about-timeline" ||
            section.variant === "about-cards" ||
            section.variant === "about-simple") && ( // Assuming highlights for simple too
            <div>
              <Label className="text-sm font-medium">
                {section.variant === "about-timeline"
                  ? "Timeline Items"
                  : section.variant === "about-cards"
                  ? "Cards"
                  : "Highlights"}
              </Label>
              <div className="space-y-2">
                {(
                  section.content[
                    section.variant === "about-timeline"
                      ? "timeline"
                      : section.variant === "about-cards"
                      ? "cards"
                      : "highlights"
                  ] || []
                ).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const field =
                          section.variant === "about-timeline"
                            ? "timeline"
                            : section.variant === "about-cards"
                            ? "cards"
                            : "highlights";
                        handleArrayItemUpdate(field, index, e.target.value);
                      }}
                      placeholder={
                        section.variant === "about-timeline"
                          ? "Timeline item"
                          : section.variant === "about-cards"
                          ? "Card title"
                          : "Highlight"
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const field =
                          section.variant === "about-timeline"
                            ? "timeline"
                            : section.variant === "about-cards"
                            ? "cards"
                            : "highlights";
                        removeArrayItem(field, index);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const field =
                      section.variant === "about-timeline"
                        ? "timeline"
                        : section.variant === "about-cards"
                        ? "cards"
                        : "highlights";
                    addArrayItem(field, "");
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add{" "}
                  {section.variant === "about-timeline"
                    ? "Timeline Item"
                    : section.variant === "about-cards"
                    ? "Card"
                    : "Highlight"}
                </Button>
              </div>
            </div>
          )}
        </div>
      );

    case "skills":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("skills").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Skills</Label>
            <div className="space-y-2">
              {(section.content.skills || []).map(
                (skill: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    {section.variant === "skills-progress" ||
                    section.variant === "skills-chart" ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={typeof skill === "object" ? skill.name : skill}
                          onChange={(e) =>
                            handleArrayItemUpdate("skills", index, {
                              ...(typeof skill === "object"
                                ? skill
                                : { name: skill, level: 50 }),
                              name: e.target.value,
                            })
                          }
                          placeholder="Skill name"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={typeof skill === "object" ? skill.level : 50}
                          onChange={(e) =>
                            handleArrayItemUpdate("skills", index, {
                              ...(typeof skill === "object"
                                ? skill
                                : { name: skill }),
                              level: parseInt(e.target.value),
                            })
                          }
                          placeholder="Skill level (0-100)"
                        />
                      </div>
                    ) : (
                      <Input
                        value={typeof skill === "object" ? skill.name : skill}
                        onChange={(e) =>
                          handleArrayItemUpdate("skills", index, e.target.value)
                        }
                        placeholder="Skill name"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("skills", index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              )}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem(
                    "skills",
                    section.variant === "skills-progress" ||
                      section.variant === "skills-chart"
                      ? { name: "", level: 50 }
                      : ""
                  )
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("projects").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Projects</Label>
            <div className="space-y-4">
              {(section.content.projects || []).map(
                (project: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Project {index + 1}</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("projects", index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={project.title || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("projects", index, {
                            ...project,
                            title: e.target.value,
                          })
                        }
                        placeholder="Project title"
                      />
                      <Textarea
                        value={project.description || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("projects", index, {
                            ...project,
                            description: e.target.value,
                          })
                        }
                        placeholder="Project description"
                      />
                      <Input
                        value={project.image || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("projects", index, {
                            ...project,
                            image: e.target.value,
                          })
                        }
                        placeholder="Project image URL"
                      />
                      <Input
                        value={project.technologies || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("projects", index, {
                            ...project,
                            technologies: e.target.value,
                          })
                        }
                        placeholder="Technologies used (comma separated)"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={project.liveUrl || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("projects", index, {
                              ...project,
                              liveUrl: e.target.value,
                            })
                          }
                          placeholder="Live URL"
                        />
                        <Input
                          value={project.githubUrl || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("projects", index, {
                              ...project,
                              githubUrl: e.target.value,
                            })
                          }
                          placeholder="GitHub URL"
                        />
                      </div>
                      {section.variant === "projects-featured" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={project.featured || false}
                            onCheckedChange={(checked) =>
                              handleArrayItemUpdate("projects", index, {
                                ...project,
                                featured: checked,
                              })
                            }
                          />
                          <Label>Featured Project</Label>
                        </div>
                      )}
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
                    image: "",
                    technologies: "",
                    liveUrl: "",
                    githubUrl: "",
                    featured: false,
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        </div>
      );

    case "experience":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("experience").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Experience</Label>
            <div className="space-y-4">
              {(section.content.experiences || []).map(
                (exp: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Experience {index + 1}</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("experiences", index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={exp.company || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("experiences", index, {
                              ...exp,
                              company: e.target.value,
                            })
                          }
                          placeholder="Company"
                        />
                        <Input
                          value={exp.position || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("experiences", index, {
                              ...exp,
                              position: e.target.value,
                            })
                          }
                          placeholder="Position"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={exp.startDate || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("experiences", index, {
                              ...exp,
                              startDate: e.target.value,
                            })
                          }
                          placeholder="Start Date"
                        />
                        <Input
                          value={exp.endDate || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("experiences", index, {
                              ...exp,
                              endDate: e.target.value,
                            })
                          }
                          placeholder="End Date (or 'Present')"
                        />
                      </div>
                      <Textarea
                        value={exp.description || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("experiences", index, {
                            ...exp,
                            description: e.target.value,
                          })
                        }
                        placeholder="Job description"
                      />
                    </div>
                  </Card>
                )
              )}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("experiences", {
                    company: "",
                    position: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        </div>
      );

    case "education":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("education").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Education</Label>
            <div className="space-y-4">
              {(section.content.education || []).map(
                (edu: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Education {index + 1}</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("education", index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={edu.institution || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("education", index, {
                              ...edu,
                              institution: e.target.value,
                            })
                          }
                          placeholder="Institution"
                        />
                        <Input
                          value={edu.degree || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("education", index, {
                              ...edu,
                              degree: e.target.value,
                            })
                          }
                          placeholder="Degree"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={edu.startDate || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("education", index, {
                              ...edu,
                              startDate: e.target.value,
                            })
                          }
                          placeholder="Start Date"
                        />
                        <Input
                          value={edu.endDate || ""}
                          onChange={(e) =>
                            handleArrayItemUpdate("education", index, {
                              ...edu,
                              endDate: e.target.value,
                            })
                          }
                          placeholder="End Date"
                        />
                      </div>
                      <Textarea
                        value={edu.description || ""}
                        onChange={(e) =>
                          handleArrayItemUpdate("education", index, {
                            ...edu,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                      />
                    </div>
                  </Card>
                )
              )}
              <Button
                variant="outline"
                onClick={() =>
                  addArrayItem("education", {
                    institution: "",
                    degree: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>
          </div>
        </div>
      );
    case "contact":
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Variant</Label>
            <Select
              value={section.variant}
              onValueChange={(value) => onUpdate({ variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getVariantOptions("contact").map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input
              value={section.content.email || ""}
              onChange={(e) => handleContentUpdate("email", e.target.value)}
              placeholder="your.email@example.com"
              type="email"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Phone</Label>
            <Input
              value={section.content.phone || ""}
              onChange={(e) => handleContentUpdate("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <Input
              value={section.content.location || ""}
              onChange={(e) => handleContentUpdate("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>

          {section.variant === "contact-form" && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={section.content.showForm || false}
                onCheckedChange={(checked) =>
                  handleContentUpdate("showForm", checked)
                }
              />
              <Label>Show Contact Form</Label>
            </div>
          )}
        </div>
      );

    default:
      return <div>Section editor not implemented for {section.type}</div>;
  }
};

// Live Preview Component
const LivePreview = ({
  portfolioData,
  device,
  theme,
  onSectionEdit,
}: {
  portfolioData: PortfolioData;
  device: "desktop" | "tablet" | "mobile";
  theme: any; // Ideally, define a Theme type
  onSectionEdit: (sectionId: string) => void;
}) => {
  const deviceStyles = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px", maxHeight: "80vh" },
    mobile: { width: "375px", height: "812px", maxHeight: "80vh" },
  };

  const currentStyle = deviceStyles[device];

  // Helper to find the variant details for a given section
  const getVariantDetails = useCallback((section: PortfolioSection) => {
    return COMPONENT_LIBRARY[section.type]?.variants.find(
      (v) => v.id === section.variant
    );
  }, []);

  const renderSectionContent = (section: PortfolioSection) => {
    const baseStyle = {
      backgroundColor: theme.background,
      color: theme.text,
      padding: "2rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      position: "relative" as const,
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "2px solid transparent",
    };

    const variantDetails = getVariantDetails(section);

    if (!variantDetails) {
      return (
        <div style={baseStyle}>
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: theme.primary }}
          >
            {section.title}
          </h2>
          <p style={{ color: theme.text }}>
            Unknown variant "{section.variant}" for {section.type} section.
          </p>
        </div>
      );
    }

    // Dynamic rendering based on section type and variant
    switch (section.type) {
      case "hero":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <div
              className={`text-center ${
                section.variant === "hero-split"
                  ? "md:text-left md:flex md:items-center md:gap-8"
                  : ""
              }`}
            >
              {section.content.profileImage && (
                <img
                  src={section.content.profileImage}
                  alt={section.content.name}
                  className={`rounded-full object-cover mx-auto mb-6 ${
                    section.variant === "hero-split"
                      ? "w-32 h-32 md:w-48 md:h-48"
                      : "w-32 h-32"
                  }`}
                />
              )}
              <div className={section.variant === "hero-split" ? "flex-1" : ""}>
                <h1
                  className={`font-bold mb-4 ${
                    section.variant === "hero-creative"
                      ? "text-6xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                      : section.variant === "hero-minimal"
                      ? "text-4xl"
                      : "text-5xl"
                  }`}
                  style={{ color: theme.primary }}
                >
                  {section.content.name || "Your Name"}
                </h1>
                <h2 className="text-xl mb-4" style={{ color: theme.secondary }}>
                  {section.content.title || "Your Title"}
                </h2>
                <p className="text-lg" style={{ color: theme.text }}>
                  {section.content.subtitle || "Your subtitle"}
                </p>
                {section.variant === "hero-video" &&
                  section.content.videoUrl && (
                    <div className="mt-4">
                      <video
                        src={section.content.videoUrl}
                        controls
                        className="w-full h-auto max-h-60"
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            {section.variant === "about-split" && section.content.image && (
              <div className="md:flex md:gap-8 md:items-center">
                <img
                  src={section.content.image}
                  alt="About"
                  className="w-full md:w-1/3 rounded-lg mb-4 md:mb-0"
                />
                <div className="md:w-2/3">
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: theme.text }}
                  >
                    {section.content.description || "Tell us about yourself..."}
                  </p>
                  {/* Render stats if available */}
                  {(section.content.stats || []).length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {section.content.stats.map((stat: any, i: number) => (
                        <div key={i}>
                          <p
                            className="text-xl font-bold"
                            style={{ color: theme.accent }}
                          >
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {section.variant === "about-timeline" && (
              <div className="space-y-4">
                <p
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: theme.text }}
                >
                  {section.content.description || "Tell us about yourself..."}
                </p>
                <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                  {(section.content.timeline || []).map(
                    (item: string, index: number) => (
                      <div
                        key={index}
                        className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2 before:w-3 before:h-3 before:rounded-full"
                        style={{
                          before: { backgroundColor: theme.primary },
                        }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: theme.text }}
                        >
                          {item}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {section.variant === "about-cards" && (
              <div className="space-y-4">
                <p
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: theme.text }}
                >
                  {section.content.description || "Tell us about yourself..."}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {(section.content.cards || []).map(
                    (card: string, index: number) => (
                      <Card
                        key={index}
                        className="p-4 flex flex-col justify-center items-center text-center"
                        style={{ borderColor: theme.primary }}
                      >
                        <Layout
                          className="w-8 h-8 mb-2"
                          style={{ color: theme.accent }}
                        />
                        <span className="font-semibold">{card}</span>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

            {(section.variant === "about-simple" ||
              section.variant === "about-creative") && (
              <p
                className="text-lg leading-relaxed"
                style={{ color: theme.text }}
              >
                {section.content.description || "Tell us about yourself..."}
              </p>
            )}
          </div>
        );

      case "skills":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            {section.variant === "skills-grid" && (
              <div className="flex flex-wrap gap-3">
                {(section.content.skills || []).map(
                  (skill: any, index: number) => (
                    <Badge
                      key={index}
                      style={{
                        backgroundColor: theme.secondary,
                        color: "white",
                      }}
                    >
                      {typeof skill === "object" ? skill.name : skill}
                    </Badge>
                  )
                )}
              </div>
            )}

            {section.variant === "skills-progress" && (
              <div className="space-y-4">
                {(section.content.skills || []).map(
                  (skill: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: theme.text }}>
                          {typeof skill === "object" ? skill.name : skill}
                        </span>
                        <span style={{ color: theme.secondary }}>
                          {typeof skill === "object" ? skill.level : 50}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: theme.primary,
                            width: `${
                              typeof skill === "object" ? skill.level : 50
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {section.variant === "skills-icons" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(section.content.skills || []).map(
                  (skill: any, index: number) => (
                    <Card
                      key={index}
                      className="text-center p-4"
                      style={{ borderColor: theme.primary }}
                    >
                      <Star
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: theme.primary }}
                      />
                      <span className="text-sm" style={{ color: theme.text }}>
                        {typeof skill === "object" ? skill.name : skill}
                      </span>
                    </Card>
                  )
                )}
              </div>
            )}

            {section.variant === "skills-categories" && (
              <div className="grid md:grid-cols-2 gap-6">
                {(
                  section.content.categories || [
                    { name: "General", skills: section.content.skills || [] },
                  ]
                ).map((category: any, index: number) => (
                  <div key={index}>
                    <h3
                      className="font-semibold mb-3"
                      style={{ color: theme.primary }}
                    >
                      {category.name || "Skills"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(category.skills || section.content.skills || []).map(
                        (skill: any, skillIndex: number) => (
                          <Badge
                            key={skillIndex}
                            variant="outline"
                            style={{
                              borderColor: theme.secondary,
                              color: theme.text,
                            }}
                          >
                            {typeof skill === "object" ? skill.name : skill}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* skills-chart rendering would require a chart library, omitted for brevity but conceptually similar */}
          </div>
        );

      case "projects":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            <div
              className={`gap-6 ${
                section.variant === "projects-grid"
                  ? "grid md:grid-cols-2"
                  : section.variant === "projects-masonry"
                  ? "columns-1 md:columns-2 lg:columns-3 space-y-6" // Added space-y for masonry gap
                  : section.variant === "projects-carousel"
                  ? "flex overflow-x-auto space-x-4 pb-4" // Added pb for scrollbar
                  : section.variant === "projects-timeline"
                  ? "space-y-8"
                  : "grid md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {(section.content.projects || []).map(
                (project: any, index: number) => (
                  <Card
                    key={index}
                    className={`${
                      section.variant === "projects-featured" &&
                      project.featured
                        ? "md:col-span-2"
                        : ""
                    } ${
                      section.variant === "projects-carousel"
                        ? "flex-shrink-0 w-80"
                        : ""
                    } ${
                      section.variant === "projects-masonry"
                        ? "break-inside-avoid"
                        : "" // Important for masonry
                    }`}
                  >
                    <CardContent className="p-6">
                      {project.image && (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3
                        className="text-xl font-semibold mb-3"
                        style={{ color: theme.primary }}
                      >
                        {project.title || "Project Title"}
                      </h3>
                      <p className="mb-4" style={{ color: theme.text }}>
                        {project.description || "Project description..."}
                      </p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies
                            .split(",")
                            .map((tech: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                style={{
                                  borderColor: theme.secondary,
                                  color: theme.text,
                                }}
                              >
                                {tech.trim()}
                              </Badge>
                            ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            style={{
                              backgroundColor: theme.primary,
                              color: "white",
                            }}
                          >
                            Live Demo
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            style={{
                              borderColor: theme.secondary,
                              color: theme.secondary,
                            }}
                          >
                            GitHub
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        );

      case "experience":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            <div
              className={`${
                section.variant === "experience-timeline"
                  ? "space-y-8 border-l-2 border-gray-200 pl-4"
                  : section.variant === "experience-cards"
                  ? "grid md:grid-cols-2 gap-6"
                  : "space-y-4"
              }`}
            >
              {(section.content.experiences || []).map(
                (exp: any, index: number) => (
                  <div
                    key={index}
                    className={`${
                      section.variant === "experience-timeline"
                        ? "relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2 before:w-3 before:h-3 before:rounded-full"
                        : section.variant === "experience-cards"
                        ? "p-6 rounded-lg border"
                        : "p-4 border-b"
                    }`}
                    style={{
                      borderColor:
                        section.variant === "experience-cards"
                          ? theme.primary
                          : theme.secondary,
                      before: { backgroundColor: theme.primary }, // Apply to pseudo-element if possible or use a div
                    }}
                  >
                    {section.variant === "experience-timeline" && (
                      <div
                        className="absolute -left-2 w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: theme.primary }}
                    >
                      {exp.position || "Position"}
                    </h3>
                    <h4
                      className="text-lg mb-2"
                      style={{ color: theme.secondary }}
                    >
                      {exp.company || "Company"}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: theme.text }}>
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    <p style={{ color: theme.text }}>
                      {exp.description || "Job description..."}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "education":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            <div
              className={`${
                section.variant === "education-timeline"
                  ? "space-y-8 border-l-2 border-gray-200 pl-4"
                  : "grid md:grid-cols-2 gap-6"
              }`}
            >
              {(section.content.education || []).map(
                (edu: any, index: number) => (
                  <div
                    key={index}
                    className={`${
                      section.variant === "education-timeline"
                        ? "relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2 before:w-3 before:h-3 before:rounded-full"
                        : "p-6 rounded-lg border"
                    }`}
                    style={{
                      borderColor: theme.primary,
                      before: { backgroundColor: theme.primary }, // Apply to pseudo-element if possible or use a div
                    }}
                  >
                    {section.variant === "education-timeline" && (
                      <div
                        className="absolute -left-2 w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: theme.primary }}
                    >
                      {edu.degree || "Degree"}
                    </h3>
                    <h4
                      className="text-lg mb-2"
                      style={{ color: theme.secondary }}
                    >
                      {edu.institution || "Institution"}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: theme.text }}>
                      {edu.startDate} - {edu.endDate || "Present"}
                    </p>
                    {edu.description && (
                      <p style={{ color: theme.text }}>{edu.description}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "contact":
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>

            <div
              className={`${
                section.variant === "contact-sidebar"
                  ? "md:flex md:gap-8"
                  : section.variant === "contact-creative"
                  ? "text-center"
                  : ""
              }`}
            >
              <div
                className={`space-y-4 ${
                  section.variant === "contact-sidebar" ? "md:w-1/2" : ""
                }`}
              >
                {section.content.email && (
                  <p style={{ color: theme.text }}>
                    <strong>Email:</strong> {section.content.email}
                  </p>
                )}
                {section.content.phone && (
                  <p style={{ color: theme.text }}>
                    <strong>Phone:</strong> {section.content.phone}
                  </p>
                )}
                {section.content.location && (
                  <p style={{ color: theme.text }}>
                    <strong>Location:</strong> {section.content.location}
                  </p>
                )}
              </div>

              {section.content.showForm && (
                <div
                  className={`mt-6 ${
                    section.variant === "contact-sidebar"
                      ? "md:w-1/2 md:mt-0"
                      : ""
                  }`}
                >
                  <div className="space-y-4">
                    <Input placeholder="Your Name" />
                    <Input placeholder="Your Email" type="email" />
                    <Textarea placeholder="Your Message" />
                    <Button
                      style={{
                        backgroundColor: theme.primary,
                        color: "white",
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div
            style={baseStyle}
            className="group hover:border-primary"
            onClick={() => onSectionEdit(section.id)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: theme.primary }}
            >
              {section.title}
            </h2>
            <p style={{ color: theme.text }}>
              Content for {section.type} section (variant: {section.variant})
            </p>
          </div>
        );
    }
  };
  return (
    <div className="flex justify-center p-4">
      <div
        className="bg-white shadow-xl transition-all duration-300 overflow-auto"
        style={{
          ...currentStyle,
          borderRadius: device !== "desktop" ? "12px" : "0",
        }}
      >
        <div
          className="min-h-full"
          style={{ backgroundColor: theme.background, color: theme.text }}
        >
          {portfolioData.sections
            .filter((section) => section.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((section) => renderSectionContent(section))}
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Builder Component
export const UnifiedPortfolioBuilder = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    about: "",
    profileImage: "",
    website: "",
    linkedin: "",
    github: "",
    theme: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#8b5cf6",
      background: "#ffffff",
      text: "#1f2937",
    },
    sections: [],
  });

  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [selectedSectionType, setSelectedSectionType] =
    useState<keyof typeof COMPONENT_LIBRARY>("hero");
  const [isPublishing, setIsPublishing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const importFileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Save to localStorage for persistence
        localStorage.setItem("portfolioData", JSON.stringify(portfolioData));

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLastSaved(new Date());
        toast.success("Portfolio auto-saved");
      } catch (error) {
        toast.error("Failed to save portfolio");
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, [portfolioData]);

  // Trigger auto-save when data changes
  useEffect(() => {
    autoSave();
  }, [portfolioData, autoSave]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("portfolioData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPortfolioData(parsed);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, []);

  // Publish functionality
  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      // First save the current portfolio
      await manualSave();

      // Then publish it
      const response = await fetch("/api/portfolios/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: portfolioData.id,
          customSlug:
            portfolioData.slug ||
            portfolioData.name.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish portfolio");
      }

      const result = await response.json();

      // Update portfolio data with published status
      setPortfolioData((prev) => ({
        ...prev,
        status: "published",
        publishedAt: new Date(),
        isPublished: true,
      }));

      // Show success message with URL
      alert(
        `Portfolio published successfully! View at: ${result.portfolioUrl}`
      );
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish portfolio. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };
  const addSection = (type: keyof typeof COMPONENT_LIBRARY) => {
    setSelectedSectionType(type);
    setShowComponentSelector(true);
  };

  const addSectionWithVariant = (
    type: keyof typeof COMPONENT_LIBRARY,
    variant: ComponentVariant // Improved type
  ) => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      type,
      variant: variant.id,
      title: variant.name, // Use variant name as default title
      content: { ...variant.defaultContent },
      isVisible: true,
      order: portfolioData.sections.length,
    };

    setPortfolioData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<PortfolioSection>
  ) => {
    setPortfolioData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setPortfolioData((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((section) => section.id !== sectionId)
        .map((section, index) => ({ ...section, order: index })),
    }));
  };

  const duplicateSection = (sectionId: string) => {
    const sectionToDuplicate = portfolioData.sections.find(
      (s) => s.id === sectionId
    );
    if (!sectionToDuplicate) return;

    const duplicatedSection: PortfolioSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      order: portfolioData.sections.length,
    };

    setPortfolioData((prev) => ({
      ...prev,
      sections: [...prev.sections, duplicatedSection],
    }));
  };
  const toggleSectionVisibility = (sectionId: string) => {
    updateSection(sectionId, {
      isVisible: !portfolioData.sections.find((s) => s.id === sectionId)
        ?.isVisible,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = portfolioData.sections.findIndex(
      (section) => section.id === active.id
    );
    const newIndex = portfolioData.sections.findIndex(
      (section) => section.id === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(
        portfolioData.sections,
        oldIndex,
        newIndex
      ).map((section, index) => ({
        ...section,
        order: index,
      }));

      setPortfolioData((prev) => ({ ...prev, sections: newSections }));
    }
  };

  const manualSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("portfolioData", JSON.stringify(portfolioData));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLastSaved(new Date());
      toast.success("Portfolio saved successfully!");
    } catch (error) {
      toast.error("Failed to save portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(portfolioData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio-data.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio data exported!");
  };

  const handleImportButtonClick = () => {
    importFileInputRef.current?.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setPortfolioData(imported);
        toast.success("Portfolio data imported!");
      } catch (error) {
        toast.error("Failed to import data");
      }
    };
    reader.readAsText(file);
  };

  const theme = {
    primary: portfolioData.theme.primary,
    secondary: portfolioData.theme.secondary,
    accent: portfolioData.theme.accent,
    background: portfolioData.theme.background,
    text: portfolioData.theme.text,
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Component Selector Modal */}
      <ComponentSelectorModal
        isOpen={showComponentSelector}
        onClose={() => setShowComponentSelector(false)}
        sectionType={selectedSectionType}
        onSelectVariant={(variant) =>
          addSectionWithVariant(selectedSectionType, variant)
        }
      />

      {/* Header */}
      <div className="border-b border-border p-4 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Preview */}
            <div className="flex rounded-lg border p-1">
              {[
                { id: "desktop", icon: Monitor },
                { id: "tablet", icon: Tablet },
                { id: "mobile", icon: Smartphone },
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant={device === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDevice(id as any)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Import/Export */}
            <div className="flex gap-1">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                ref={importFileInputRef} // Use ref here
              />
              {/* Publish Button */}
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : portfolioData.status === "published" ? (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Update Live
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleImportButtonClick} // Use handler
              >
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                Export
              </Button>
            </div>
            <Button onClick={manualSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Builder */}
        <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-4">Portfolio Sections</h2>

            {/* Add Section Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {Object.entries(COMPONENT_LIBRARY).map(([key, library]) => {
                const icons = {
                  hero: User,
                  about: User,
                  skills: Star,
                  projects: Code,
                  experience: Briefcase,
                  education: GraduationCap,
                  contact: Mail,
                };
                const Icon = icons[key as keyof typeof icons] || User; // Cast key for type safety
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addSection(key as keyof typeof COMPONENT_LIBRARY)
                    }
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs capitalize">{key}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={portfolioData.sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {portfolioData.sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onUpdate={updateSection}
                      onDelete={deleteSection}
                      onToggleVisibility={toggleSectionVisibility}
                      onDuplicate={duplicateSection}
                      isEditing={editingSection}
                      onEdit={(id) =>
                        setEditingSection(editingSection === id ? null : id)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {portfolioData.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />{" "}
                {/* Changed icon to Layout */}
                <p>No sections added yet</p>
                <p className="text-sm">
                  Add sections to start building your portfolio
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="flex-1 bg-muted/10 overflow-auto">
          <LivePreview
            portfolioData={portfolioData}
            device={device}
            theme={theme}
            onSectionEdit={(sectionId) => setEditingSection(sectionId)}
          />
        </div>

        {/* Right Sidebar - Theme Customization */}
        <div className="w-80 border-l border-border bg-muted/30 p-4">
          <h2 className="font-semibold mb-4">Customize Theme</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Portfolio Information
              </Label>
              <div className="space-y-3">
                <Input
                  value={portfolioData.name}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Your Name"
                />
                <Input
                  value={portfolioData.title}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Your Title"
                />
                <Input
                  value={portfolioData.email}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Your Email"
                  type="email"
                />
                <Input
                  value={portfolioData.phone}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Your Phone"
                />
                <Input
                  value={portfolioData.location}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Your Location"
                />
                <Input
                  value={portfolioData.website}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="Your Website"
                />
                <Input
                  value={portfolioData.linkedin}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      linkedin: e.target.value,
                    }))
                  }
                  placeholder="LinkedIn URL"
                />
                <Input
                  value={portfolioData.github}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      github: e.target.value,
                    }))
                  }
                  placeholder="GitHub URL"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Primary Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.primary}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, primary: e.target.value },
                    }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.primary}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, primary: e.target.value },
                    }))
                  }
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Secondary Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.secondary}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, secondary: e.target.value },
                    }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.secondary}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, secondary: e.target.value },
                    }))
                  }
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Accent Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.accent}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, accent: e.target.value },
                    }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.accent}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, accent: e.target.value },
                    }))
                  }
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Background Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.background}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, background: e.target.value },
                    }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.background}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, background: e.target.value },
                    }))
                  }
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Text Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.text}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, text: e.target.value },
                    }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.text}
                  onChange={(e) =>
                    setPortfolioData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, text: e.target.value },
                    }))
                  }
                  placeholder="#1f2937"
                  className="flex-1"
                />
              </div>
            </div>
            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium">Quick Color Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    primary: "#3b82f6",
                    secondary: "#64748b",
                    accent: "#8b5cf6",
                    background: "#ffffff",
                    text: "#1f2937",
                    name: "Blue",
                  },
                  {
                    primary: "#10b981",
                    secondary: "#6b7280",
                    accent: "#f59e0b",
                    background: "#ffffff",
                    text: "#1f2937",
                    name: "Green",
                  },
                  {
                    primary: "#f59e0b",
                    secondary: "#6b7280",
                    accent: "#ef4444",
                    background: "#ffffff",
                    text: "#1f2937",
                    name: "Orange",
                  },
                  {
                    primary: "#8b5cf6",
                    secondary: "#6b7280",
                    accent: "#06b6d4",
                    background: "#ffffff",
                    text: "#1f2937",
                    name: "Purple",
                  },
                  {
                    primary: "#ef4444",
                    secondary: "#6b7280",
                    accent: "#10b981",
                    background: "#ffffff",
                    text: "#1f2937",
                    name: "Red",
                  },
                  {
                    primary: "#1f2937",
                    secondary: "#9ca3af",
                    accent: "#3b82f6",
                    background: "#f9fafb",
                    text: "#111827",
                    name: "Dark",
                  },
                ].map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPortfolioData((prev) => ({
                        ...prev,
                        theme: {
                          primary: preset.primary,
                          secondary: preset.secondary,
                          accent: preset.accent,
                          background: preset.background,
                          text: preset.text,
                        },
                      }))
                    }
                    className="h-auto p-2 flex flex-col items-center gap-1"
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
