import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { componentRegistry, ComponentVariant } from '@/lib/component-registry';

interface ComponentSelectorProps {
  onSelectComponent: (variant: ComponentVariant) => void;
  className?: string;
}

const ComponentCard = ({ 
  variant, 
  onSelect 
}: { 
  variant: ComponentVariant; 
  onSelect: () => void;
}) => {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-medium line-clamp-1">
              {variant.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {variant.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Preview placeholder */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">{variant.name} Preview</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {variant.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Add button */}
        <Button 
          onClick={onSelect}
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};

const ComponentSelector: React.FC<ComponentSelectorProps> = ({ 
  onSelectComponent,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = componentRegistry.categories;

  // Filter and search components
  const filteredVariants = useMemo(() => {
    const categoryVariants = activeCategory === 'all' 
      ? componentRegistry.getAllVariants()
      : componentRegistry.getVariants(activeCategory);
    
    if (!searchQuery.trim()) {
      return categoryVariants;
    }
    
    return componentRegistry.searchVariants(searchQuery, activeCategory === 'all' ? undefined : activeCategory);
  }, [searchQuery, activeCategory]);

  const handleComponentSelect = (variant: ComponentVariant) => {
    onSelectComponent(variant);
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Section</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories and Components */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 m-4 mb-0">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {categories.slice(0, 7).map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="text-xs"
              >
                {category.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="all" className="mt-0">
              <ComponentGrid 
                variants={filteredVariants}
                viewMode={viewMode}
                onSelect={handleComponentSelect}
              />
            </TabsContent>
            
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <ComponentGrid 
                  variants={filteredVariants}
                  viewMode={viewMode}
                  onSelect={handleComponentSelect}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

const ComponentGrid = ({ 
  variants, 
  viewMode, 
  onSelect 
}: { 
  variants: ComponentVariant[];
  viewMode: 'grid' | 'list';
  onSelect: (variant: ComponentVariant) => void;
}) => {
  if (variants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">No components found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or browse different categories
        </p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-4"
    }>
      {variants.map((variant) => (
        <ComponentCard
          key={variant.id}
          variant={variant}
          onSelect={() => onSelect(variant)}
        />
      ))}
    </div>
  );
};

export default ComponentSelector;