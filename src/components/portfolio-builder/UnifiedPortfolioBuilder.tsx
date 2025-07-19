"use client";

import { useState, useCallback, useReducer, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Check
} from 'lucide-react';

import { toast } from 'sonner';
import { authClient } from '../../../auth-client';

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
  lastSaved?: Date;
  editingSection?: string;
}

type PortfolioAction = 
  | { type: 'LOAD_PORTFOLIO'; payload: Portfolio }
  | { type: 'UPDATE_PORTFOLIO'; payload: Partial<Portfolio> }
  | { type: 'ADD_SECTION'; payload: PortfolioSection }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<PortfolioSection> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: PortfolioSection[] }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_PUBLISHING'; payload: boolean }
  | { type: 'SET_EDITING_SECTION'; payload: string | undefined }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case 'LOAD_PORTFOLIO':
      return {
        ...state,
        portfolio: action.payload,
        history: [action.payload],
        historyIndex: 0
      };

    case 'UPDATE_PORTFOLIO': {
      const updatedPortfolio = { ...state.portfolio, ...action.payload };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

    case 'ADD_SECTION': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: [...state.portfolio.sections, action.payload]
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

    case 'UPDATE_SECTION': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: state.portfolio.sections.map(section =>
          section.id === action.payload.id
            ? { ...section, ...action.payload.updates }
            : section
        )
      };
      return {
        ...state,
        portfolio: updatedPortfolio
      };
    }

    case 'DELETE_SECTION': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: state.portfolio.sections
          .filter(section => section.id !== action.payload)
          .map((section, index) => ({ ...section, order: index }))
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...state,
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

    case 'REORDER_SECTIONS': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: action.payload.map((section, index) => ({ ...section, order: index }))
      };
      return {
        ...state,
        portfolio: updatedPortfolio
      };
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_PUBLISHING':
      return { ...state, isPublishing: action.payload };

    case 'SET_EDITING_SECTION':
      return { ...state, editingSection: action.payload };

    case 'SAVE_SUCCESS':
      return { ...state, lastSaved: new Date() };

    case 'UNDO': {
      if (state.historyIndex > 0) {
        return {
          ...state,
          portfolio: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          portfolio: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1
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
  onDelete 
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
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
      } ${!section.isVisible ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{section.title}</h4>
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
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
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
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
  onClose 
}: {
  section: PortfolioSection;
  onUpdate: (updates: Partial<PortfolioSection>) => void;
  onClose: () => void;
}) => {
  const [localContent, setLocalContent] = useState(section.content);
  const [localTitle, setLocalTitle] = useState(section.title);

  const handleSave = () => {
    onUpdate({ 
      content: localContent, 
      title: localTitle 
    });
    onClose();
  };

  const updateContent = (key: string, value: any) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
  };

  const addArrayItem = (key: string, item: any) => {
    const currentArray = localContent[key] || [];
    setLocalContent(prev => ({
      ...prev,
      [key]: [...currentArray, item]
    }));
  };

  const removeArrayItem = (key: string, index: number) => {
    const currentArray = localContent[key] || [];
    setLocalContent(prev => ({
      ...prev,
      [key]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (key: string, index: number, updates: any) => {
    const currentArray = localContent[key] || [];
    setLocalContent(prev => ({
      ...prev,
      [key]: currentArray.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit {section.type}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
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

        {section.type === 'hero' && (
          <>
            <div>
              <Label htmlFor="hero-name">Name</Label>
              <Input
                id="hero-name"
                value={localContent.name || ''}
                onChange={(e) => updateContent('name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={localContent.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Your professional title"
              />
            </div>
            <div>
              <Label htmlFor="hero-description">Description</Label>
              <Textarea
                id="hero-description"
                value={localContent.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                placeholder="Brief description about yourself"
              />
            </div>
          </>
        )}

        {section.type === 'about' && (
          <>
            <div>
              <Label htmlFor="about-content">About Content</Label>
              <Textarea
                id="about-content"
                value={localContent.content || ''}
                onChange={(e) => updateContent('content', e.target.value)}
                placeholder="Tell your story..."
                rows={6}
              />
            </div>
          </>
        )}

        {section.type === 'skills' && (
          <div>
            <Label>Skills</Label>
            <div className="space-y-2">
              {(localContent.skills || []).map((skill: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                    placeholder="Skill name"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('skills', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('skills', '')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        )}

        {section.type === 'projects' && (
          <div>
            <Label>Projects</Label>
            <div className="space-y-4">
              {(localContent.projects || []).map((project: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('projects', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Input
                      value={project.title || ''}
                      onChange={(e) => updateArrayItem('projects', index, { title: e.target.value })}
                      placeholder="Project title"
                    />
                    
                    <Textarea
                      value={project.description || ''}
                      onChange={(e) => updateArrayItem('projects', index, { description: e.target.value })}
                      placeholder="Project description"
                      rows={3}
                    />

                    <div>
                      <Label>Links</Label>
                      <div className="space-y-2">
                        {(project.links || []).map((link: any, linkIndex: number) => (
                          <div key={linkIndex} className="flex gap-2">
                            <Input
                              value={link.label || ''}
                              onChange={(e) => {
                                const newLinks = [...(project.links || [])];
                                newLinks[linkIndex] = { ...link, label: e.target.value };
                                updateArrayItem('projects', index, { links: newLinks });
                              }}
                              placeholder="Link label"
                            />
                            <Input
                              value={link.url || ''}
                              onChange={(e) => {
                                const newLinks = [...(project.links || [])];
                                newLinks[linkIndex] = { ...link, url: e.target.value };
                                updateArrayItem('projects', index, { links: newLinks });
                              }}
                              placeholder="URL"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLinks = (project.links || []).filter((_: any, i: number) => i !== linkIndex);
                                updateArrayItem('projects', index, { links: newLinks });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newLinks = [...(project.links || []), { label: '', url: '' }];
                            updateArrayItem('projects', index, { links: newLinks });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Link
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="space-y-2">
                        {(project.tags || []).map((tag: string, tagIndex: number) => (
                          <div key={tagIndex} className="flex gap-2">
                            <Input
                              value={tag}
                              onChange={(e) => {
                                const newTags = [...(project.tags || [])];
                                newTags[tagIndex] = e.target.value;
                                updateArrayItem('projects', index, { tags: newTags });
                              }}
                              placeholder="Tag"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTags = (project.tags || []).filter((_: string, i: number) => i !== tagIndex);
                                updateArrayItem('projects', index, { tags: newTags });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTags = [...(project.tags || []), ''];
                            updateArrayItem('projects', index, { tags: newTags });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('projects', { 
                  title: '', 
                  description: '', 
                  links: [], 
                  tags: [] 
                })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        )}

        {section.type === 'contact' && (
          <>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={localContent.email || ''}
                onChange={(e) => updateContent('email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={localContent.phone || ''}
                onChange={(e) => updateContent('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={localContent.message || ''}
                onChange={(e) => updateContent('message', e.target.value)}
                placeholder="Get in touch message"
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
  onEdit 
}: {
  section: PortfolioSection;
  theme: any;
  onEdit: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!section.isVisible) return null;

  return (
    <div
      className="relative group cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        padding: '2rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: isHovered ? `2px solid ${theme.primary}` : '2px solid transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEdit}
    >
      {isHovered && (
        <div className="absolute top-2 right-2 z-10">
          <Button size="sm" variant="secondary">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primary }}>
        {section.title}
      </h2>

      {section.type === 'hero' && (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{section.content.name || 'Your Name'}</h1>
          <h2 className="text-2xl">{section.content.title || 'Your Title'}</h2>
          <p className="text-lg">{section.content.description || 'Your description'}</p>
        </div>
      )}

      {section.type === 'about' && (
        <div>
          <p className="text-lg leading-relaxed">
            {section.content.content || 'Tell your story here...'}
          </p>
        </div>
      )}

      {section.type === 'skills' && (
        <div className="flex flex-wrap gap-2">
          {(section.content.skills || []).map((skill: string, index: number) => (
            <Badge key={index} style={{ backgroundColor: theme.primary, color: 'white' }}>
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {section.type === 'projects' && (
        <div className="grid gap-4 md:grid-cols-2">
          {(section.content.projects || []).map((project: any, index: number) => (
            <Card key={index} className="p-4">
              <h3 className="font-semibold mb-2">{project.title || 'Project Title'}</h3>
              <p className="text-sm mb-3">{project.description || 'Project description'}</p>
              
              {project.links && project.links.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {project.links.map((link: any, linkIndex: number) => (
                    <Button key={linkIndex} size="sm" variant="outline">
                      {link.label || 'Link'}
                    </Button>
                  ))}
                </div>
              )}
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {section.type === 'contact' && (
        <div className="space-y-4">
          <p>Email: {section.content.email || 'your.email@example.com'}</p>
          <p>Phone: {section.content.phone || '+1 (555) 123-4567'}</p>
          <p>{section.content.message || 'Get in touch with me!'}</p>
        </div>
      )}
    </div>
  );
};

// Main builder component
export const UnifiedPortfolioBuilder = () => {
  const { data: session } = authClient.useSession();
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Initialize portfolio state
  const initialPortfolio: Portfolio = {
    name: 'My Portfolio',
    sections: [],
    theme: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1e293b'
    },
    isPublished: false
  };

  const [state, dispatch] = useReducer(portfolioReducer, {
    portfolio: initialPortfolio,
    history: [initialPortfolio],
    historyIndex: 0,
    isSaving: false,
    isPublishing: false,
    editingSection: undefined
  });

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (state.portfolio.id) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [state.portfolio]);

  // Load portfolio on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      loadPortfolio(editId);
    } else {
      // Create new portfolio
      createNewPortfolio();
    }
  }, []);

  const createNewPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Portfolio',
          slug: `portfolio-${Date.now()}`,
          sections: [],
          globalSettings: {
            theme: { colorScheme: 'default', fontPairing: 'inter-system', spacing: 'comfortable' },
            seo: { title: 'My Portfolio', description: '', keywords: [] },
            domain: { subdomain: `portfolio-${Date.now()}` },
            analytics: { trackingEnabled: false }
          }
        })
      });

      if (response.ok) {
        const portfolio = await response.json();
        dispatch({ type: 'LOAD_PORTFOLIO', payload: portfolio });
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      toast.error('Failed to create portfolio');
    }
  };

  const loadPortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios?id=${id}`);
      if (response.ok) {
        const portfolio = await response.json();
        dispatch({ type: 'LOAD_PORTFOLIO', payload: portfolio });
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      toast.error('Failed to load portfolio');
    }
  };

  const handleSave = async () => {
    if (!state.portfolio.id) return;

    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      const response = await fetch('/api/portfolios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.portfolio)
      });

      if (response.ok) {
        dispatch({ type: 'SAVE_SUCCESS' });
        toast.success('Portfolio saved');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save portfolio');
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const handlePublish = async () => {
    if (!state.portfolio.id) {
      toast.error('Please save your portfolio first');
      return;
    }

    dispatch({ type: 'SET_PUBLISHING', payload: true });
    
    try {
      const response = await fetch('/api/portfolios/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          portfolioId: state.portfolio.id,
          customSlug: state.portfolio.name.toLowerCase().replace(/\s+/g, '-')
        })
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ 
          type: 'UPDATE_PORTFOLIO', 
          payload: { 
            isPublished: true, 
            publishedUrl: result.portfolioUrl 
          } 
        });
        toast.success(`Portfolio published! URL: ${result.portfolioUrl}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Publish failed');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish portfolio');
    } finally {
      dispatch({ type: 'SET_PUBLISHING', payload: false });
    }
  };

  const addSection = (type: string) => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: {},
      isVisible: true,
      order: state.portfolio.sections.length
    };

    dispatch({ type: 'ADD_SECTION', payload: newSection });
    toast.success(`Added ${type} section`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = state.portfolio.sections.findIndex(section => section.id === active.id);
    const newIndex = state.portfolio.sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(state.portfolio.sections, oldIndex, newIndex);
      dispatch({ type: 'REORDER_SECTIONS', payload: newSections });
    }
  };

  const editingSection = state.portfolio.sections.find(s => s.id === state.editingSection);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <Badge variant={state.portfolio.isPublished ? 'default' : 'secondary'}>
              {state.portfolio.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Device preview */}
            <div className="flex rounded-lg border p-1">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone }
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant={selectedDevice === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice(id as any)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Save button */}
            <Button 
              onClick={handleSave} 
              disabled={state.isSaving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {state.isSaving ? 'Saving...' : 'Save'}
            </Button>

            {/* Publish button */}
            <Button 
              onClick={handlePublish}
              disabled={state.isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {state.portfolio.isPublished ? (
                <Share2 className="w-4 h-4 mr-2" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              {state.isPublishing ? 'Publishing...' : 
               state.portfolio.isPublished ? 'Update Live' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Sections */}
        <div className="w-80 border-r border-border bg-muted/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Portfolio Sections</h3>
              <Badge variant="outline">
                {state.portfolio.sections.length} sections
              </Badge>
            </div>

            {/* Add section buttons */}
            <div className="grid grid-cols-2 gap-2">
              {['hero', 'about', 'skills', 'projects', 'contact'].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addSection(type)}
                  className="capitalize"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {type}
                </Button>
              ))}
            </div>

            {/* Sections list */}
            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <SortableContext 
                items={state.portfolio.sections.map(s => s.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {state.portfolio.sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onEdit={() => dispatch({ type: 'SET_EDITING_SECTION', payload: section.id })}
                      onToggleVisibility={() => dispatch({
                        type: 'UPDATE_SECTION',
                        payload: { id: section.id, updates: { isVisible: !section.isVisible } }
                      })}
                      onDuplicate={() => {
                        const duplicated = {
                          ...section,
                          id: `section-${Date.now()}`,
                          order: state.portfolio.sections.length
                        };
                        dispatch({ type: 'ADD_SECTION', payload: duplicated });
                      }}
                      onDelete={() => dispatch({ type: 'DELETE_SECTION', payload: section.id })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {state.portfolio.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sections added yet</p>
                <p className="text-sm">Add sections to start building</p>
              </div>
            )}
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 bg-muted/10 overflow-auto p-8">
          <div className="flex justify-center">
            <div
              className={`bg-white shadow-xl transition-all duration-300 ${
                selectedDevice === 'mobile' ? 'w-[375px] min-h-[812px]' :
                selectedDevice === 'tablet' ? 'w-[768px] min-h-[1024px]' :
                'w-full max-w-6xl min-h-[800px]'
              } ${selectedDevice !== 'desktop' ? 'rounded-lg overflow-hidden' : ''}`}
            >
              {state.portfolio.sections.length > 0 ? (
                <div className="min-h-full">
                  {state.portfolio.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <PreviewSection
                        key={section.id}
                        section={section}
                        theme={state.portfolio.theme}
                        onEdit={() => dispatch({ type: 'SET_EDITING_SECTION', payload: section.id })}
                      />
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                    <p className="text-muted-foreground">
                      Add sections from the sidebar to build your portfolio
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar - Section editor or theme controls */}
        <div className="w-80 border-l border-border bg-background p-4 overflow-y-auto">
          {editingSection ? (
            <SectionEditor
              section={editingSection}
              onUpdate={(updates) => dispatch({
                type: 'UPDATE_SECTION',
                payload: { id: editingSection.id, updates }
              })}
              onClose={() => dispatch({ type: 'SET_EDITING_SECTION', payload: undefined })}
            />
          ) : (
            <div className="space-y-6">
              <h3 className="font-semibold">Theme Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={state.portfolio.theme.primary}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_PORTFOLIO',
                      payload: {
                        theme: {
                          ...state.portfolio.theme,
                          primary: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <Input
                    id="secondary-color"
                    type="color"
                    value={state.portfolio.theme.secondary}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_PORTFOLIO',
                      payload: {
                        theme: {
                          ...state.portfolio.theme,
                          secondary: e.target.value
                        }
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio-name">Portfolio Name</Label>
                  <Input
                    id="portfolio-name"
                    value={state.portfolio.name}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_PORTFOLIO',
                      payload: { name: e.target.value }
                    })}
                    placeholder="My Portfolio"
                  />
                </div>
              </div>

              {state.lastSaved && (
                <div className="text-sm text-muted-foreground">
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