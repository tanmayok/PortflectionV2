"use client";

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  Copy, 
  Trash2,
  User,
  Briefcase,
  Code,
  GraduationCap,
  Mail,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { SectionConfig, PortfolioSection, SectionType } from '@/types/theme-system';
import { SortableSection } from './SortableSection';

interface SectionBuilderProps {
  sections: PortfolioSection[];
  availableSections: SectionConfig[];
  onSectionsChange: (sections: PortfolioSection[]) => void;
  onSectionEdit: (section: PortfolioSection) => void;
  onSectionPreview: (section: PortfolioSection) => void;
}

const sectionIcons: Record<SectionType, any> = {
  hero: User,
  about: User,
  projects: Code,
  skills: Star,
  experience: Briefcase,
  education: GraduationCap,
  testimonials: Star,
  contact: Mail,
  custom: ImageIcon
};

export const SectionBuilder = ({
  sections,
  availableSections,
  onSectionsChange,
  onSectionEdit,
  onSectionPreview
}: SectionBuilderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSectionLibrary, setShowSectionLibrary] = useState(false);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = sections.findIndex(section => section.id === active.id);
    const newIndex = sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = [...sections];
      const [movedSection] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, movedSection);
      
      // Update order values
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      onSectionsChange(updatedSections);
    }
    
    setActiveId(null);
  }, [sections, onSectionsChange]);

  const addSection = useCallback((sectionConfig: SectionConfig) => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      sectionConfigId: sectionConfig.id,
      order: sections.length,
      isVisible: true,
      content: {},
      styleOverrides: {},
      layoutOverrides: {}
    };

    onSectionsChange([...sections, newSection]);
    setShowSectionLibrary(false);
  }, [sections, onSectionsChange]);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, isVisible: !section.isVisible }
        : section
    );
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const duplicateSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = sections.find(s => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const duplicatedSection: PortfolioSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      order: sections.length,
      content: { ...sectionToDuplicate.content }
    };

    onSectionsChange([...sections, duplicatedSection]);
  }, [sections, onSectionsChange]);

  const deleteSection = useCallback((sectionId: string) => {
    const updatedSections = sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));
    
    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  const getSectionConfig = (sectionConfigId: string) => {
    return availableSections.find(config => config.id === sectionConfigId);
  };

  const SectionLibrary = () => {
    const categorizedSections = availableSections.reduce((acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = [];
      }
      acc[section.category].push(section);
      return acc;
    }, {} as Record<string, SectionConfig[]>);

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Section
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSectionLibrary(false)}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(categorizedSections).map(([category, sectionConfigs]) => (
              <div key={category}>
                <h4 className="font-medium mb-3 capitalize">{category} Sections</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectionConfigs.map((sectionConfig) => {
                    const Icon = sectionIcons[sectionConfig.type] || ImageIcon;
                    return (
                      <Card 
                        key={sectionConfig.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addSection(sectionConfig)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{sectionConfig.name}</h5>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {sectionConfig.description}
                              </p>
                            </div>
                          </div>
                          {sectionConfig.isRequired && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Required
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Sections</h2>
          <p className="text-muted-foreground">
            Drag and drop to reorder sections, or add new ones from the library
          </p>
        </div>
        <Button onClick={() => setShowSectionLibrary(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Section Library */}
      {showSectionLibrary && <SectionLibrary />}

      {/* Sections List */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((section) => {
              const sectionConfig = getSectionConfig(section.sectionConfigId);
              if (!sectionConfig) return null;

              return (
                <SortableSection
                  key={section.id}
                  section={section}
                  sectionConfig={sectionConfig}
                  onEdit={() => onSectionEdit(section)}
                  onPreview={() => onSectionPreview(section)}
                  onToggleVisibility={() => toggleSectionVisibility(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white shadow-lg rounded-lg p-4 border-2 border-primary">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">
                  {getSectionConfig(
                    sections.find(s => s.id === activeId)?.sectionConfigId || ''
                  )?.name}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {sections.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sections added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your portfolio by adding sections from our library
            </p>
            <Button onClick={() => setShowSectionLibrary(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};