"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Palette, 
  Layout, 
  Sparkles, 
  Filter,
  Eye,
  Download,
  Heart,
  Star
} from 'lucide-react';
import { ThemeConfig } from '@/types/theme-system';

interface ThemeSelectorProps {
  themes: ThemeConfig[];
  selectedTheme?: ThemeConfig;
  onThemeSelect: (theme: ThemeConfig) => void;
  onCustomizeTheme: (theme: ThemeConfig) => void;
  onPreviewTheme: (theme: ThemeConfig) => void;
}

export const ThemeSelector = ({
  themes,
  selectedTheme,
  onThemeSelect,
  onCustomizeTheme,
  onPreviewTheme
}: ThemeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'recent'>('popularity');

  const categories = [
    { id: 'all', name: 'All Themes', icon: Layout },
    { id: 'minimal', name: 'Minimal', icon: Sparkles },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'professional', name: 'Professional', icon: Star },
    { id: 'artistic', name: 'Artistic', icon: Heart }
  ];

  const filteredThemes = useMemo(() => {
    let filtered = themes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(theme => theme.category === selectedCategory);
    }

    // Sort themes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [themes, searchQuery, selectedCategory, sortBy]);

  const ThemeCard = ({ theme }: { theme: ThemeConfig }) => {
    const isSelected = selectedTheme?.id === theme.id;

    return (
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : ''
        }`}
        onClick={() => onThemeSelect(theme)}
      >
        <CardHeader className="p-0">
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            {/* Theme Preview */}
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              }}
            >
              {/* Mock content preview */}
              <div className="absolute inset-4 bg-white/90 rounded-lg p-4 space-y-2">
                <div 
                  className="h-3 rounded"
                  style={{ backgroundColor: theme.colors.primary, width: '60%' }}
                />
                <div 
                  className="h-2 rounded"
                  style={{ backgroundColor: theme.colors.text.secondary, width: '80%' }}
                />
                <div 
                  className="h-2 rounded"
                  style={{ backgroundColor: theme.colors.text.secondary, width: '40%' }}
                />
                <div className="flex gap-1 mt-3">
                  <div 
                    className="h-6 w-12 rounded"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div 
                    className="h-6 w-12 rounded"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
              </div>
            </div>

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewTheme(theme);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomizeTheme(theme);
                }}
              >
                <Palette className="w-4 h-4 mr-1" />
                Customize
              </Button>
            </div>

            {/* Theme badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant="secondary" className="text-xs">
                {theme.category}
              </Badge>
              {theme.isCustom && (
                <Badge variant="outline" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>

            {/* Popularity indicator */}
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-white">{theme.popularity}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{theme.name}</h3>
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {theme.description}
            </p>

            {/* Color palette preview */}
            <div className="flex items-center gap-1 mt-3">
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.colors.background }}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {theme.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {theme.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{theme.tags.length - 3}
                </Badge>
              )}
            </div>
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
          <h2 className="text-2xl font-bold">Choose Your Theme</h2>
          <p className="text-muted-foreground">
            Select a theme that matches your style and customize it to make it yours
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Import Theme
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="popularity">Most Popular</option>
            <option value="name">Name A-Z</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Theme grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredThemes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>

            {/* Empty state */}
            {filteredThemes.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No themes found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};