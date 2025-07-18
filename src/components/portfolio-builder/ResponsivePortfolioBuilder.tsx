import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Plus, 
  Save, 
  Eye, 
  Settings,
  Palette,
  Type,
  Layout,
  Sparkles,
  Grid3X3,
  Ruler,
  Undo,
  Redo,
  Copy,
  Trash2,
  GripVertical,
  User,
  Briefcase,
  Code,
  GraduationCap,
  Mail,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

// Types for the portfolio builder
interface Section {
  id: string;
  type: 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'contact';
  title: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
  styles?: Record<string, any>;
}

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
  };
  spacing: {
    scale: number;
  };
}

interface DevicePreview {
  id: 'desktop' | 'tablet' | 'mobile';
  name: string;
  icon: React.ComponentType;
  width: string;
  height: string;
}

// Device configurations for responsive preview
const DEVICES: DevicePreview[] = [
  { id: 'desktop', name: 'Desktop', icon: Monitor, width: '100%', height: '100%' },
  { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px', height: '812px' }
];

// Available section types
const SECTION_TYPES = [
  { id: 'hero', name: 'Hero Section', icon: User, description: 'Main introduction with name and title' },
  { id: 'about', name: 'About Me', icon: User, description: 'Personal bio and introduction' },
  { id: 'skills', name: 'Skills', icon: Star, description: 'Technical and soft skills' },
  { id: 'projects', name: 'Projects', icon: Code, description: 'Portfolio projects and work' },
  { id: 'experience', name: 'Experience', icon: Briefcase, description: 'Work history and roles' },
  { id: 'education', name: 'Education', icon: GraduationCap, description: 'Academic background' },
  { id: 'contact', name: 'Contact', icon: Mail, description: 'Contact information and form' }
];

// Default themes
const DEFAULT_THEMES: Theme[] = [
  {
    id: 'modern',
    name: 'Modern Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Inter, sans-serif'
    },
    spacing: { scale: 1 }
  },
  {
    id: 'elegant',
    name: 'Elegant Dark',
    colors: {
      primary: '#f59e0b',
      secondary: '#6b7280',
      accent: '#ec4899',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb'
    },
    typography: {
      fontFamily: 'Playfair Display, serif',
      headingFont: 'Playfair Display, serif'
    },
    spacing: { scale: 1.2 }
  },
  {
    id: 'minimal',
    name: 'Minimal Green',
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b'
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      headingFont: 'Roboto, sans-serif'
    },
    spacing: { scale: 0.9 }
  }
];

// Sortable Section Component
const SortableSection: React.FC<{
  section: Section;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ section, onEdit, onToggleVisibility, onDuplicate, onDelete }) => {
  const sectionType = SECTION_TYPES.find(type => type.id === section.type);
  const Icon = sectionType?.icon || User;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!section.isVisible ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{section.title}</h4>
                {!section.isVisible && (
                  <Badge variant="outline" className="text-xs">Hidden</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Order: {section.order + 1} • {sectionType?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleVisibility} className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-8 w-8 p-0">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Theme Card Component
const ThemeCard: React.FC<{
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ theme, isSelected, onSelect }) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
    }`}
    onClick={onSelect}
  >
    <CardHeader className="p-0">
      <div className="h-32 rounded-t-lg overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
        <div className="p-4 h-full flex flex-col justify-between" style={{ color: theme.colors.text }}>
          <div>
            <div 
              className="h-3 w-16 rounded mb-2" 
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div 
              className="h-2 w-24 rounded mb-1" 
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <div 
              className="h-2 w-20 rounded" 
              style={{ backgroundColor: theme.colors.secondary }}
            />
          </div>
          <div className="flex gap-1">
            <div 
              className="h-4 w-8 rounded" 
              style={{ backgroundColor: theme.colors.accent }}
            />
            <div 
              className="h-4 w-8 rounded" 
              style={{ backgroundColor: theme.colors.primary }}
            />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <h3 className="font-semibold">{theme.name}</h3>
      <div className="flex gap-1 mt-2">
        {Object.values(theme.colors).slice(0, 4).map((color, i) => (
          <div 
            key={i} 
            className="w-4 h-4 rounded-full border" 
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Main Portfolio Builder Component
export const ResponsivePortfolioBuilder: React.FC = () => {
  // State management
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(DEFAULT_THEMES[0]);
  const [activeDevice, setActiveDevice] = useState<DevicePreview['id']>('desktop');
  const [activeTab, setActiveTab] = useState('themes');
  const [showGrid, setShowGrid] = useState(false);
  const [showSpacing, setShowSpacing] = useState(false);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [history, setHistory] = useState<Section[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Responsive breakpoints
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive layout classes
  const getResponsiveClasses = useMemo(() => {
    if (windowWidth < 768) {
      return 'flex-col'; // Mobile: stack vertically
    } else if (windowWidth < 1024) {
      return 'flex-col lg:flex-row'; // Tablet: conditional layout
    }
    return 'flex-row'; // Desktop: side by side
  }, [windowWidth]);

  // History management
  const saveToHistory = useCallback((newSections: Section[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSections]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  // Section management
  const addSection = useCallback((type: Section['type']) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: SECTION_TYPES.find(t => t.id === type)?.name || 'New Section',
      content: {},
      isVisible: true,
      order: sections.length
    };
    
    const newSections = [...sections, newSection];
    setSections(newSections);
    saveToHistory(newSections);
    toast.success(`${newSection.title} added successfully`);
  }, [sections, saveToHistory]);

  const toggleSectionVisibility = useCallback((id: string) => {
    const newSections = sections.map(section =>
      section.id === id ? { ...section, isVisible: !section.isVisible } : section
    );
    setSections(newSections);
    saveToHistory(newSections);
  }, [sections, saveToHistory]);

  const duplicateSection = useCallback((id: string) => {
    const sectionToDuplicate = sections.find(s => s.id === id);
    if (!sectionToDuplicate) return;

    const duplicatedSection: Section = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      order: sections.length
    };

    const newSections = [...sections, duplicatedSection];
    setSections(newSections);
    saveToHistory(newSections);
    toast.success('Section duplicated successfully');
  }, [sections, saveToHistory]);

  const deleteSection = useCallback((id: string) => {
    const newSections = sections
      .filter(section => section.id !== id)
      .map((section, index) => ({ ...section, order: index }));
    
    setSections(newSections);
    saveToHistory(newSections);
    toast.success('Section deleted successfully');
  }, [sections, saveToHistory]);

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const section = sections.find(s => s.id === event.active.id);
    setDraggedSection(section || null);
  }, [sections]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDraggedSection(null);
      return;
    }

    const oldIndex = sections.findIndex(section => section.id === active.id);
    const newIndex = sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index
      }));
      
      setSections(newSections);
      saveToHistory(newSections);
      toast.success('Section reordered successfully');
    }
    
    setDraggedSection(null);
  }, [sections, saveToHistory]);

  // Save portfolio
  const savePortfolio = useCallback(async () => {
    try {
      // Here you would implement the actual save logic
      toast.success('Portfolio saved successfully!');
    } catch (error) {
      toast.error('Failed to save portfolio');
    }
  }, [sections, selectedTheme]);

  // Get current device dimensions
  const currentDevice = DEVICES.find(d => d.id === activeDevice) || DEVICES[0];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b border-border p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="h-8 w-8 p-0"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="h-8 w-8 p-0"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button onClick={savePortfolio} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex overflow-hidden ${getResponsiveClasses}`}>
        {/* Left Sidebar - Builder Controls */}
        <div className="w-full lg:w-80 border-r border-border bg-muted/30 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="themes" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Themes</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Sections</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4 pt-0">
              <TabsContent value="themes" className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">Choose Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {DEFAULT_THEMES.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedTheme.id === theme.id}
                        onSelect={() => setSelectedTheme(theme)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sections" className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Portfolio Sections</h3>
                    <Badge variant="secondary">{sections.length} sections</Badge>
                  </div>

                  {/* Add Section Buttons */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3">Add Section</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTION_TYPES.map((sectionType) => {
                        const Icon = sectionType.icon;
                        return (
                          <Button
                            key={sectionType.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(sectionType.id as Section['type'])}
                            className="h-auto p-3 flex flex-col items-center gap-2"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs">{sectionType.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sections List */}
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {sections.map((section) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            onEdit={() => toast.info('Edit functionality coming soon')}
                            onToggleVisibility={() => toggleSectionVisibility(section.id)}
                            onDuplicate={() => duplicateSection(section.id)}
                            onDelete={() => deleteSection(section.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay>
                      {draggedSection ? (
                        <div className="bg-white shadow-lg rounded-lg p-4 border-2 border-primary">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">{draggedSection.title}</span>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>

                  {sections.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sections added yet</p>
                      <p className="text-sm">Add sections to start building your portfolio</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4 space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Preview Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Show Grid</Label>
                        <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Show Spacing</Label>
                        <Switch checked={showSpacing} onCheckedChange={setShowSpacing} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Theme Customization</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-2 block">Primary Color</Label>
                        <Input
                          type="color"
                          value={selectedTheme.colors.primary}
                          onChange={(e) => setSelectedTheme({
                            ...selectedTheme,
                            colors: { ...selectedTheme.colors, primary: e.target.value }
                          })}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-2 block">Spacing Scale</Label>
                        <Slider
                          value={[selectedTheme.spacing.scale]}
                          onValueChange={([value]) => setSelectedTheme({
                            ...selectedTheme,
                            spacing: { scale: value }
                          })}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Current: {selectedTheme.spacing.scale}x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Center - Preview Area */}
        <div className="flex-1 bg-muted/10 flex flex-col">
          {/* Preview Toolbar */}
          <div className="border-b border-border p-4 bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Preview</h3>
                
                {/* Device Selector */}
                <div className="flex rounded-lg border p-1">
                  {DEVICES.map((device) => {
                    const Icon = device.icon;
                    return (
                      <Button
                        key={device.id}
                        variant={activeDevice === device.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveDevice(device.id)}
                        className="h-8 w-8 p-0"
                        title={device.name}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Toggle Grid">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Toggle Spacing">
                  <Ruler className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto bg-muted/20 p-4 sm:p-8">
            <div className="flex justify-center">
              <div
                className="bg-white shadow-xl transition-all duration-300 overflow-auto relative"
                style={{
                  width: currentDevice.width,
                  height: activeDevice === 'desktop' ? 'auto' : currentDevice.height,
                  minHeight: activeDevice === 'desktop' ? '600px' : currentDevice.height,
                  maxHeight: activeDevice !== 'desktop' ? currentDevice.height : 'none',
                  borderRadius: activeDevice !== 'desktop' ? '12px' : '0',
                }}
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 z-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, ${selectedTheme.colors.primary} 1px, transparent 1px),
                        linear-gradient(to bottom, ${selectedTheme.colors.primary} 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />
                )}

                {/* Portfolio Preview Content */}
                <div
                  className="min-h-full p-4 sm:p-8"
                  style={{
                    backgroundColor: selectedTheme.colors.background,
                    color: selectedTheme.colors.text,
                    fontFamily: selectedTheme.typography.fontFamily,
                  }}
                >
                  {sections.filter(s => s.isVisible).length > 0 ? (
                    sections
                      .filter(section => section.isVisible)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div
                          key={section.id}
                          className="mb-8 p-6 rounded-lg border-2 border-dashed border-transparent hover:border-primary/30 transition-colors"
                          style={{
                            backgroundColor: selectedTheme.colors.surface,
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold" style={{ color: selectedTheme.colors.primary }}>
                              {section.title}
                            </h2>
                            <Badge variant="outline" className="text-xs">
                              {section.type}
                            </Badge>
                          </div>
                          
                          {/* Section Content Preview */}
                          <div className="space-y-4">
                            {section.type === 'hero' && (
                              <div className="text-center space-y-4">
                                <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-r from-primary to-secondary" />
                                <h1 className="text-3xl font-bold">Your Name</h1>
                                <p className="text-lg text-muted-foreground">Your Professional Title</p>
                                <Button style={{ backgroundColor: selectedTheme.colors.primary }}>
                                  Get In Touch
                                </Button>
                              </div>
                            )}
                            
                            {section.type === 'about' && (
                              <div className="space-y-4">
                                <p className="text-muted-foreground">
                                  This is where your personal bio and introduction would appear. 
                                  You can customize this content to tell your story.
                                </p>
                              </div>
                            )}
                            
                            {section.type === 'skills' && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {['React', 'TypeScript', 'Node.js', 'Python', 'Design', 'Leadership'].map((skill) => (
                                  <div key={skill} className="p-3 rounded-lg bg-primary/10 text-center">
                                    <span className="font-medium">{skill}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {section.type === 'projects' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[1, 2].map((project) => (
                                  <Card key={project}>
                                    <CardContent className="p-4">
                                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded mb-4" />
                                      <h3 className="font-semibold mb-2">Project {project}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        Project description and details would appear here.
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                            
                            {(section.type === 'experience' || section.type === 'education') && (
                              <div className="space-y-4">
                                {[1, 2].map((item) => (
                                  <div key={item} className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">
                                      {section.type === 'experience' ? 'Company Name' : 'University Name'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {section.type === 'experience' ? 'Job Title' : 'Degree Program'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">2020 - Present</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {section.type === 'contact' && (
                              <div className="text-center space-y-4">
                                <h3 className="text-xl font-semibold">Get In Touch</h3>
                                <p className="text-muted-foreground">
                                  Ready to work together? Let's create something amazing.
                                </p>
                                <div className="flex justify-center gap-4">
                                  <Button style={{ backgroundColor: selectedTheme.colors.primary }}>
                                    Send Message
                                  </Button>
                                  <Button variant="outline">
                                    Download CV
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                          <Layout className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No sections added</h3>
                          <p className="text-muted-foreground">
                            Add sections from the builder to see your portfolio come to life
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivePortfolioBuilder;