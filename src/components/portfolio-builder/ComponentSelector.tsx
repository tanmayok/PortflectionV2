"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Eye, 
  Settings,
  Grid3X3,
  List,
  Filter,
  Star
} from 'lucide-react';
import { ComponentVariant, ComponentCategory } from '@/types/component-system';
import { componentRegistry } from '@/lib/component-registry';

interface ComponentSelectorProps {
  onSelectComponent: (variant: ComponentVariant) => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export const ComponentSelector = ({
  onSelectComponent,
  selectedCategory,
  onCategoryChange
}: ComponentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = componentRegistry.categories;
  const activeCategory = selectedCategory || categories[0]?.id;

  // Get filtered variants
  const filteredVariants = useMemo(() => {
    let variants = searchQuery 
      ? componentRegistry.searchVariants(searchQuery, activeCategory)
      : componentRegistry.getVariants(activeCategory);

    // Filter by tags
    if (selectedTags.length > 0) {
      variants = variants.filter(variant =>
        selectedTags.some(tag => variant.tags.includes(tag))
      );
    }

    return variants;
  }, [searchQuery, activeCategory, selectedTags]);

  // Get all available tags for current category
  const availableTags = useMemo(() => {
    const variants = componentRegistry.getVariants(activeCategory);
    const tags = new Set<string>();
    variants.forEach(variant => {
      variant.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [activeCategory]);

  const ComponentPreview = ({ variant }: { variant: ComponentVariant }) => {
    return (
      <Card 
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/20"
        onClick={() => onSelectComponent(variant)}
      >
        <CardHeader className="p-0">
          <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/5 to-secondary/5">
            {/* Component Preview Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">{variant.name}</div>
              </div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm sm:text-lg">{variant.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {variant.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {variant.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {variant.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{variant.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Version */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>v{variant.version}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>Popular</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ComponentListItem = ({ variant }: { variant: ComponentVariant }) => {
    return (
      <Card 
        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
        onClick={() => onSelectComponent(variant)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg mb-1">{variant.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                {variant.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {variant.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
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
          <h2 className="text-xl sm:text-2xl font-bold">Component Library</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Choose from pre-built components to build your portfolio
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">List</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter by Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
            
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs p-2 sm:p-3">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold">{category.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
            </div>

            {filteredVariants.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4"
              }>
                {filteredVariants.map((variant) => (
                  viewMode === 'grid' ? (
                    <ComponentPreview key={variant.id} variant={variant} />
                  ) : (
                    <ComponentListItem key={variant.id} variant={variant} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No components found</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {searchQuery || selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'Components are loading...'
                  }
                </p>
                {!searchQuery && selectedTags.length === 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Components
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};