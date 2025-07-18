"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
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

interface SortableSectionProps {
  section: PortfolioSection;
  sectionConfig: SectionConfig;
  onEdit: () => void;
  onPreview: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const SortableSection = ({
  section,
  sectionConfig,
  onEdit,
  onPreview,
  onToggleVisibility,
  onDuplicate,
  onDelete
}: SortableSectionProps) => {
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

  const Icon = sectionIcons[sectionConfig.type] || ImageIcon;

  // Calculate content completion
  const requiredFields = sectionConfig.fields.filter(field => field.required);
  const completedFields = requiredFields.filter(field => 
    section.content[field.id] && section.content[field.id] !== ''
  );
  const completionPercentage = requiredFields.length > 0 
    ? Math.round((completedFields.length / requiredFields.length) * 100)
    : 100;

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
          {/* Drag handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Section info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{sectionConfig.name}</h4>
                {sectionConfig.isRequired && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
                {!section.isVisible && (
                  <Badge variant="outline" className="text-xs">
                    Hidden
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Order: {section.order + 1}</span>
                <span>
                  Content: {completionPercentage}% complete
                </span>
                {completionPercentage < 100 && (
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
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
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            {!sectionConfig.isRequired && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content preview */}
        {Object.keys(section.content).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {sectionConfig.fields.slice(0, 4).map((field) => {
                const value = section.content[field.id];
                if (!value) return null;

                return (
                  <div key={field.id}>
                    <span className="text-muted-foreground">{field.label}:</span>
                    <p className="font-medium truncate">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};