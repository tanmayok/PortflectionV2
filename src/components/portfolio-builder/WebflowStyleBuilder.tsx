"use client";

import { useState, useCallback, useReducer, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Undo,
  Redo,
  Play,
  Share2
} from 'lucide-react';

import { ComponentSelector } from './ComponentSelector';
import { AutoSaveManager } from './AutoSaveManager';
import { 
  Portfolio, 
  PortfolioSection, 
  ComponentVariant, 
  AutoSaveState 
} from '@/types/component-system';
import { componentRegistry } from '@/lib/component-registry';
import { toast } from 'sonner';

// Portfolio state management
interface PortfolioState {
  portfolio: Portfolio;
  history: Portfolio[];
  historyIndex: number;
}

type PortfolioAction = 
  | { type: 'UPDATE_PORTFOLIO'; payload: Portfolio }
  | { type: 'ADD_SECTION'; payload: PortfolioSection }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<PortfolioSection> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: PortfolioSection[] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case 'UPDATE_PORTFOLIO': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        portfolio: action.payload,
        history: [...newHistory, action.payload],
        historyIndex: newHistory.length
      };
    }

    case 'ADD_SECTION': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: [...state.portfolio.sections, action.payload],
        updatedAt: new Date()
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
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
        ),
        updatedAt: new Date()
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

    case 'DELETE_SECTION': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: state.portfolio.sections
          .filter(section => section.id !== action.payload)
          .map((section, index) => ({ ...section, order: index })),
        updatedAt: new Date()
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

    case 'REORDER_SECTIONS': {
      const updatedPortfolio = {
        ...state.portfolio,
        sections: action.payload.map((section, index) => ({ ...section, order: index })),
        updatedAt: new Date()
      };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        portfolio: updatedPortfolio,
        history: [...newHistory, updatedPortfolio],
        historyIndex: newHistory.length
      };
    }

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

  const variant = componentRegistry.getVariant(section.componentVariantId);

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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{variant?.name || 'Unknown Component'}</h4>
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
              Order: {section.order + 1} • {variant?.description || 'No description'}
            </p>
          </div>

          {/* Actions */}
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

// Main builder component
export const WebflowStyleBuilder = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Initialize portfolio state
  const initialPortfolio: Portfolio = {
    id: 'new-portfolio',
    userId: 'current-user',
    name: 'My Portfolio',
    slug: 'my-portfolio',
    status: 'draft',
    sections: [],
    globalSettings: {
      theme: {
        colorScheme: 'default',
        fontPairing: 'inter-system',
        spacing: 'comfortable'
      },
      seo: {
        title: 'My Portfolio',
        description: 'Welcome to my portfolio',
        keywords: []
      },
      domain: {
        subdomain: 'my-portfolio'
      },
      analytics: {
        trackingEnabled: false
      }
    },
    metadata: {
      views: 0,
      version: 1,
      backups: []
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSavedAt: new Date(),
    autoSaveEnabled: true
  };

  const [state, dispatch] = useReducer(portfolioReducer, {
    portfolio: initialPortfolio,
    history: [initialPortfolio],
    historyIndex: 0
  });

  // Handle component selection
  const handleSelectComponent = useCallback((variant: ComponentVariant) => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      type: variant.category.id as any,
      componentVariantId: variant.id,
      order: state.portfolio.sections.length,
      isVisible: true,
      content: Object.entries(variant.props).reduce((acc, [key, prop]) => {
        acc[key] = prop.defaultValue;
        return acc;
      }, {} as Record<string, any>)
    };

    dispatch({ type: 'ADD_SECTION', payload: newSection });
    toast.success(`Added ${variant.name} component`);
  }, [state.portfolio.sections.length]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = state.portfolio.sections.findIndex(section => section.id === active.id);
    const newIndex = state.portfolio.sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(state.portfolio.sections, oldIndex, newIndex);
      dispatch({ type: 'REORDER_SECTIONS', payload: newSections });
    }
  }, [state.portfolio.sections]);

  // Section actions
  const handleEditSection = useCallback((sectionId: string) => {
    setEditingSection(sectionId);
    setActiveTab('settings');
  }, []);

  const handleToggleVisibility = useCallback((sectionId: string) => {
    const section = state.portfolio.sections.find(s => s.id === sectionId);
    if (section) {
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          id: sectionId,
          updates: { isVisible: !section.isVisible }
        }
      });
    }
  }, [state.portfolio.sections]);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    const section = state.portfolio.sections.find(s => s.id === sectionId);
    if (section) {
      const duplicatedSection: PortfolioSection = {
        ...section,
        id: `section-${Date.now()}`,
        order: state.portfolio.sections.length
      };
      dispatch({ type: 'ADD_SECTION', payload: duplicatedSection });
      toast.success('Section duplicated');
    }
  }, [state.portfolio.sections]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    dispatch({ type: 'DELETE_SECTION', payload: sectionId });
    toast.success('Section deleted');
  }, []);

  // Save function
  const handleSave = useCallback(async (portfolio: Portfolio) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving portfolio:', portfolio);
  }, []);

  // Publish function
  const handlePublish = useCallback(async () => {
    try {
      const publishedPortfolio = {
        ...state.portfolio,
        status: 'published' as const,
        publishedAt: new Date()
      };
      
      await handleSave(publishedPortfolio);
      dispatch({ type: 'UPDATE_PORTFOLIO', payload: publishedPortfolio });
      toast.success('Portfolio published successfully!');
    } catch (error) {
      toast.error('Failed to publish portfolio');
    }
  }, [state.portfolio, handleSave]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <Badge variant={state.portfolio.status === 'published' ? 'default' : 'secondary'}>
              {state.portfolio.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.historyIndex >= state.history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>

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

            {/* Publish button */}
            <Button onClick={handlePublish}>
              <Play className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Auto-save wrapper */}
      <AutoSaveManager
        portfolio={state.portfolio}
        onSave={handleSave}
        autoSaveInterval={3000}
      >
        {(autoSaveState: AutoSaveState, triggerSave: () => void) => (
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar */}
            <div className="w-80 border-r border-border bg-muted/30">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-4 pt-0">
                  <TabsContent value="components" className="mt-4">
                    <ComponentSelector onSelectComponent={handleSelectComponent} />
                  </TabsContent>

                  <TabsContent value="sections" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Portfolio Sections</h3>
                        <Badge variant="outline">
                          {state.portfolio.sections.length} sections
                        </Badge>
                      </div>

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
                                onEdit={() => handleEditSection(section.id)}
                                onToggleVisibility={() => handleToggleVisibility(section.id)}
                                onDuplicate={() => handleDuplicateSection(section.id)}
                                onDelete={() => handleDeleteSection(section.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      {state.portfolio.sections.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No sections added yet</p>
                          <p className="text-sm">Add components to start building</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Portfolio Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Global portfolio settings and SEO options.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Center - Preview area */}
            <div className="flex-1 bg-muted/10 flex flex-col">
              {/* Preview header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Live Preview</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="flex-1 overflow-auto p-8">
                <div className="flex justify-center">
                  <div
                    className={`bg-white shadow-xl transition-all duration-300 ${
                      selectedDevice === 'mobile' ? 'w-[375px] h-[812px]' :
                      selectedDevice === 'tablet' ? 'w-[768px] h-[1024px]' :
                      'w-full max-w-6xl'
                    } ${selectedDevice !== 'desktop' ? 'rounded-lg overflow-hidden' : ''}`}
                  >
                    {state.portfolio.sections.length > 0 ? (
                      <div className="min-h-full">
                        {state.portfolio.sections
                          .filter(section => section.isVisible)
                          .sort((a, b) => a.order - b.order)
                          .map((section) => {
                            const variant = componentRegistry.getVariant(section.componentVariantId);
                            return (
                              <div
                                key={section.id}
                                className="border-b border-gray-100 last:border-b-0 p-8"
                                style={{ backgroundColor: variant?.styling.colorScheme.background }}
                              >
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold mb-2">
                                    {variant?.name || 'Unknown Component'}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {variant?.description || 'Component preview'}
                                  </p>
                                  <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                                    <p className="text-sm">Component content will render here</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[400px]">
                        <div className="text-center">
                          <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                          <p className="text-muted-foreground">
                            Add components from the library to build your portfolio
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AutoSaveManager>
    </div>
  );
};