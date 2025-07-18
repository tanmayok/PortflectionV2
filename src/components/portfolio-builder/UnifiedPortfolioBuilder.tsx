"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  GraduationCap,
  Mail,
  Star,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Types
interface PortfolioSection {
  id: string;
  type: 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'contact';
  title: string;
  content: Record<string, any>;
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
  theme: {
    primary: string;
    secondary: string;
  };
  sections: PortfolioSection[];
}

// Section Templates
const SECTION_TEMPLATES = {
  hero: {
    type: 'hero' as const,
    title: 'Hero Section',
    icon: User,
    defaultContent: {
      name: '',
      title: '',
      subtitle: '',
      profileImage: ''
    }
  },
  about: {
    type: 'about' as const,
    title: 'About Me',
    icon: User,
    defaultContent: {
      description: '',
      highlights: []
    }
  },
  skills: {
    type: 'skills' as const,
    title: 'Skills',
    icon: Star,
    defaultContent: {
      skills: []
    }
  },
  projects: {
    type: 'projects' as const,
    title: 'Projects',
    icon: Code,
    defaultContent: {
      projects: []
    }
  },
  experience: {
    type: 'experience' as const,
    title: 'Experience',
    icon: Briefcase,
    defaultContent: {
      experiences: []
    }
  },
  education: {
    type: 'education' as const,
    title: 'Education',
    icon: GraduationCap,
    defaultContent: {
      education: []
    }
  },
  contact: {
    type: 'contact' as const,
    title: 'Contact',
    icon: Mail,
    defaultContent: {
      email: '',
      phone: '',
      location: '',
      socials: {}
    }
  }
};

// Sortable Section Component
const SortableSection = ({ section, onUpdate, onDelete, onToggleVisibility, isEditing, onEdit }) => {
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

  const template = SECTION_TEMPLATES[section.type];
  const Icon = template.icon;

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`transition-all duration-200 ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} ${!section.isVisible ? 'opacity-60' : ''}`}
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
            <h4 className="font-medium">{section.title}</h4>
            <p className="text-sm text-muted-foreground">Order: {section.order + 1}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(section.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(section.id)}
              className="h-8 w-8 p-0"
            >
              {section.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
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
const SectionEditor = ({ section, onUpdate }) => {
  const handleContentUpdate = (field, value) => {
    onUpdate({
      content: {
        ...section.content,
        [field]: value
      }
    });
  };

  const addArrayItem = (field, item) => {
    const currentArray = section.content[field] || [];
    handleContentUpdate(field, [...currentArray, item]);
  };

  const updateArrayItem = (field, index, item) => {
    const currentArray = section.content[field] || [];
    const newArray = [...currentArray];
    newArray[index] = item;
    handleContentUpdate(field, newArray);
  };

  const removeArrayItem = (field, index) => {
    const currentArray = section.content[field] || [];
    handleContentUpdate(field, currentArray.filter((_, i) => i !== index));
  };

  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={section.content.name || ''}
              onChange={(e) => handleContentUpdate('name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={section.content.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
              placeholder="Your professional title"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input
              value={section.content.subtitle || ''}
              onChange={(e) => handleContentUpdate('subtitle', e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Profile Image URL</label>
            <Input
              value={section.content.profileImage || ''}
              onChange={(e) => handleContentUpdate('profileImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      );

    case 'about':
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={section.content.description || ''}
              onChange={(e) => handleContentUpdate('description', e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-24"
            />
          </div>
        </div>
      );

    case 'skills':
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Skills</label>
            <div className="space-y-2">
              {(section.content.skills || []).map((skill, index) => (
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
        </div>
      );

    case 'projects':
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Projects</label>
            <div className="space-y-4">
              {(section.content.projects || []).map((project, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Project {index + 1}</h5>
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
                      onChange={(e) => updateArrayItem('projects', index, { ...project, title: e.target.value })}
                      placeholder="Project title"
                    />
                    <Textarea
                      value={project.description || ''}
                      onChange={(e) => updateArrayItem('projects', index, { ...project, description: e.target.value })}
                      placeholder="Project description"
                    />
                    <Input
                      value={project.technologies || ''}
                      onChange={(e) => updateArrayItem('projects', index, { ...project, technologies: e.target.value })}
                      placeholder="Technologies used (comma separated)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={project.liveUrl || ''}
                        onChange={(e) => updateArrayItem('projects', index, { ...project, liveUrl: e.target.value })}
                        placeholder="Live URL"
                      />
                      <Input
                        value={project.githubUrl || ''}
                        onChange={(e) => updateArrayItem('projects', index, { ...project, githubUrl: e.target.value })}
                        placeholder="GitHub URL"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('projects', { title: '', description: '', technologies: '', liveUrl: '', githubUrl: '' })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={section.content.email || ''}
              onChange={(e) => handleContentUpdate('email', e.target.value)}
              placeholder="your.email@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={section.content.phone || ''}
              onChange={(e) => handleContentUpdate('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={section.content.location || ''}
              onChange={(e) => handleContentUpdate('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>
      );

    default:
      return <div>Section editor not implemented for {section.type}</div>;
  }
};

// Live Preview Component
const LivePreview = ({ portfolioData, device, theme }) => {
  const deviceStyles = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px', maxHeight: '80vh' },
    mobile: { width: '375px', height: '812px', maxHeight: '80vh' }
  };

  const currentStyle = deviceStyles[device];

  return (
    <div className="flex justify-center p-4">
      <div
        className="bg-white shadow-xl transition-all duration-300 overflow-auto"
        style={{
          ...currentStyle,
          borderRadius: device !== 'desktop' ? '12px' : '0',
        }}
      >
        <div className="min-h-full" style={{ backgroundColor: theme.background, color: theme.text }}>
          {portfolioData.sections
            .filter(section => section.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <PreviewSection key={section.id} section={section} theme={theme} />
            ))}
        </div>
      </div>
    </div>
  );
};

// Preview Section Component
const PreviewSection = ({ section, theme }) => {
  const renderContent = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="text-center py-20 px-8">
            {section.content.profileImage && (
              <img
                src={section.content.profileImage}
                alt={section.content.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
            )}
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.primary }}>
              {section.content.name || 'Your Name'}
            </h1>
            <h2 className="text-xl mb-4" style={{ color: theme.secondary }}>
              {section.content.title || 'Your Title'}
            </h2>
            <p className="text-lg" style={{ color: theme.text }}>
              {section.content.subtitle || 'Your subtitle'}
            </p>
          </div>
        );

      case 'about':
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>About Me</h2>
            <p className="text-lg leading-relaxed" style={{ color: theme.text }}>
              {section.content.description || 'Tell us about yourself...'}
            </p>
          </div>
        );

      case 'skills':
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Skills</h2>
            <div className="flex flex-wrap gap-3">
              {(section.content.skills || []).map((skill, index) => (
                <Badge key={index} style={{ backgroundColor: theme.secondary, color: 'white' }}>
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {(section.content.projects || []).map((project, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primary }}>
                    {project.title || 'Project Title'}
                  </h3>
                  <p className="mb-4" style={{ color: theme.text }}>
                    {project.description || 'Project description...'}
                  </p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.split(',').map((tech, i) => (
                        <Badge key={i} variant="outline">{tech.trim()}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <Button size="sm" style={{ backgroundColor: theme.primary }}>
                        Live Demo
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button size="sm" variant="outline">
                        GitHub
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="py-16 px-8 text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Contact Me</h2>
            <div className="space-y-4">
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
          </div>
        );

      default:
        return (
          <div className="py-16 px-8">
            <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>
              {section.title}
            </h2>
            <p style={{ color: theme.text }}>Content for {section.type} section</p>
          </div>
        );
    }
  };

  return (
    <section className="border-b border-gray-100">
      {renderContent()}
    </section>
  );
};

// Main Portfolio Builder Component
export const UnifiedPortfolioBuilder = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    profileImage: '',
    theme: {
      primary: '#3b82f6',
      secondary: '#64748b'
    },
    sections: []
  });

  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLastSaved(new Date());
        toast.success('Portfolio auto-saved');
      } catch (error) {
        toast.error('Failed to save portfolio');
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, []);

  // Trigger auto-save when data changes
  useEffect(() => {
    autoSave();
  }, [portfolioData, autoSave]);

  const addSection = (type: keyof typeof SECTION_TEMPLATES) => {
    const template = SECTION_TEMPLATES[type];
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      type,
      title: template.title,
      content: { ...template.defaultContent },
      isVisible: true,
      order: portfolioData.sections.length
    };

    setPortfolioData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<PortfolioSection>) => {
    setPortfolioData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setPortfolioData(prev => ({
      ...prev,
      sections: prev.sections
        .filter(section => section.id !== sectionId)
        .map((section, index) => ({ ...section, order: index }))
    }));
  };

  const toggleSectionVisibility = (sectionId: string) => {
    updateSection(sectionId, {
      isVisible: !portfolioData.sections.find(s => s.id === sectionId)?.isVisible
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = portfolioData.sections.findIndex(section => section.id === active.id);
    const newIndex = portfolioData.sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(portfolioData.sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index
      }));
      
      setPortfolioData(prev => ({ ...prev, sections: newSections }));
    }
  };

  const manualSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastSaved(new Date());
      toast.success('Portfolio saved successfully!');
    } catch (error) {
      toast.error('Failed to save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  const theme = {
    primary: portfolioData.theme.primary,
    secondary: portfolioData.theme.secondary,
    background: '#ffffff',
    text: '#1f2937'
  };

  return (
    <div className="h-screen flex flex-col bg-background">
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
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone }
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant={device === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice(id as any)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
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
              {Object.entries(SECTION_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => addSection(key as any)}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{template.title}</span>
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
                items={portfolioData.sections.map(s => s.id)} 
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
                      isEditing={editingSection}
                      onEdit={(id) => setEditingSection(editingSection === id ? null : id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {portfolioData.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sections added yet</p>
                <p className="text-sm">Add sections to start building your portfolio</p>
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
          />
        </div>

        {/* Right Sidebar - Theme Customization */}
        <div className="w-80 border-l border-border bg-muted/30 p-4">
          <h2 className="font-semibold mb-4">Customize Theme</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.primary}
                  onChange={(e) => setPortfolioData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, primary: e.target.value }
                  }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.primary}
                  onChange={(e) => setPortfolioData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, primary: e.target.value }
                  }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={portfolioData.theme.secondary}
                  onChange={(e) => setPortfolioData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, secondary: e.target.value }
                  }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={portfolioData.theme.secondary}
                  onChange={(e) => setPortfolioData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, secondary: e.target.value }
                  }))}
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium">Quick Color Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { primary: '#3b82f6', secondary: '#64748b', name: 'Blue' },
                  { primary: '#10b981', secondary: '#6b7280', name: 'Green' },
                  { primary: '#f59e0b', secondary: '#6b7280', name: 'Orange' },
                  { primary: '#8b5cf6', secondary: '#6b7280', name: 'Purple' },
                  { primary: '#ef4444', secondary: '#6b7280', name: 'Red' },
                  { primary: '#06b6d4', secondary: '#6b7280', name: 'Cyan' }
                ].map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setPortfolioData(prev => ({
                      ...prev,
                      theme: { primary: preset.primary, secondary: preset.secondary }
                    }))}
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