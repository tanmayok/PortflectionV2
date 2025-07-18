# Component Library Troubleshooting Guide

## Common Issues and Solutions

### 1. "No components found" Error

#### Symptoms
- Component selector shows "No components found" message
- Empty component library despite having registered components
- Categories appear but no components within them

#### Root Causes & Solutions

**A. Component Registry Not Initialized**
```typescript
// Check if registry is properly initialized
console.log('Registry categories:', componentRegistry.categories);
console.log('Registry variants:', componentRegistry.variants);

// If empty, the registry constructor might not be running
// Solution: Ensure the registry is imported and used correctly
import { componentRegistry } from '@/lib/component-registry';
```

**B. Components Not Registered**
```typescript
// Check if components are registered in the constructor
private registerDefaultComponents() {
  // Ensure this method is called and contains component registrations
  this.register('hero', { /* component config */ });
}
```

**C. Category Mismatch**
```typescript
// Ensure category IDs match between registration and selection
const categories = componentRegistry.categories; // Check available categories
const variants = componentRegistry.getVariants('hero'); // Check specific category
```

#### Quick Fix
```typescript
// Add debug logging to component registry
export const componentRegistry = new PortfolioComponentRegistry();

// Debug in browser console
console.log('Available categories:', componentRegistry.categories);
console.log('Hero variants:', componentRegistry.getVariants('hero'));
console.log('All variants:', componentRegistry.getAllVariants());
```

### 2. Responsive Design Issues

#### Symptoms
- Components not displaying properly on mobile/tablet
- Layout breaking on smaller screens
- Touch interactions not working

#### Solutions

**A. CSS Grid/Flexbox Issues**
```css
/* Fix grid responsiveness */
.component-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

/* Mobile-first approach */
@media (max-width: 767px) {
  .component-selector-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
```

**B. Touch Target Size**
```css
/* Ensure touch targets are at least 44px */
@media (hover: none) and (pointer: coarse) {
  .component-card button {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem;
  }
}
```

**C. Viewport Meta Tag**
```html
<!-- Ensure this is in your HTML head -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 3. Component Selection Not Working

#### Symptoms
- Clicking components doesn't trigger selection
- No feedback when components are selected
- Components appear but can't be added

#### Solutions

**A. Event Handler Issues**
```typescript
// Check if onSelectComponent is properly passed
const ComponentSelector = ({ onSelectComponent }: ComponentSelectorProps) => {
  // Ensure this function is defined and working
  const handleSelect = (variant: ComponentVariant) => {
    console.log('Selecting component:', variant);
    onSelectComponent(variant);
  };
};
```

**B. Component State Issues**
```typescript
// Check if component state is properly managed
const [selectedComponents, setSelectedComponents] = useState([]);

const handleComponentSelect = (variant: ComponentVariant) => {
  setSelectedComponents(prev => [...prev, variant]);
  // Add visual feedback
  toast.success(`Added ${variant.name} component`);
};
```

### 4. Performance Issues

#### Symptoms
- Slow component loading
- Laggy interactions
- High memory usage

#### Solutions

**A. Lazy Loading**
```typescript
// Implement lazy loading for component previews
const ComponentPreview = lazy(() => import('./ComponentPreview'));

// Use Suspense wrapper
<Suspense fallback={<ComponentSkeleton />}>
  <ComponentPreview variant={variant} />
</Suspense>
```

**B. Memoization**
```typescript
// Memoize expensive calculations
const filteredVariants = useMemo(() => {
  return componentRegistry.searchVariants(searchQuery, activeCategory);
}, [searchQuery, activeCategory]);

// Memoize components
const MemoizedComponentCard = memo(ComponentCard);
```

**C. Virtual Scrolling**
```typescript
// For large component lists, implement virtual scrolling
import { FixedSizeList as List } from 'react-window';

const ComponentList = ({ variants }) => (
  <List
    height={600}
    itemCount={variants.length}
    itemSize={200}
    itemData={variants}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ComponentCard variant={data[index]} />
      </div>
    )}
  </List>
);
```

### 5. Search and Filtering Issues

#### Symptoms
- Search not returning results
- Filters not working
- Tags not displaying

#### Solutions

**A. Search Implementation**
```typescript
// Ensure search is case-insensitive and comprehensive
searchVariants(query: string, categoryId?: string): ComponentVariant[] {
  const variants = categoryId ? this.getVariants(categoryId) : this.getAllVariants();
  const lowercaseQuery = query.toLowerCase().trim();
  
  if (!lowercaseQuery) return variants;
  
  return variants.filter(variant => 
    variant.name.toLowerCase().includes(lowercaseQuery) ||
    variant.description.toLowerCase().includes(lowercaseQuery) ||
    variant.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    variant.category.name.toLowerCase().includes(lowercaseQuery)
  );
}
```

**B. Tag Filtering**
```typescript
// Ensure tags are properly extracted and filtered
const availableTags = useMemo(() => {
  const variants = componentRegistry.getVariants(activeCategory);
  const tags = new Set<string>();
  
  variants.forEach(variant => {
    if (variant.tags && Array.isArray(variant.tags)) {
      variant.tags.forEach(tag => {
        if (tag && typeof tag === 'string') {
          tags.add(tag.toLowerCase());
        }
      });
    }
  });
  
  return Array.from(tags).sort();
}, [activeCategory]);
```

### 6. Mobile-Specific Issues

#### Symptoms
- Components not visible on mobile
- Scrolling issues
- Touch gestures not working

#### Solutions

**A. Mobile Layout**
```css
/* Ensure proper mobile layout */
@media (max-width: 767px) {
  .component-selector {
    padding: 0.5rem;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .component-card {
    min-height: 160px;
    padding: 0.75rem;
  }
}
```

**B. Touch Scrolling**
```css
/* Enable smooth scrolling on mobile */
.component-container {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}
```

**C. Mobile Navigation**
```typescript
// Implement mobile-friendly navigation
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Use bottom sheet or drawer for mobile filters
const MobileFilterSheet = () => (
  <Sheet open={showFilters} onOpenChange={setShowFilters}>
    <SheetContent side="bottom" className="h-[80vh]">
      <FilterContent />
    </SheetContent>
  </Sheet>
);
```

## Debugging Tools

### 1. Component Registry Debug
```typescript
// Add to browser console for debugging
window.debugRegistry = {
  categories: () => componentRegistry.categories,
  variants: (categoryId) => componentRegistry.getVariants(categoryId),
  search: (query) => componentRegistry.searchVariants(query),
  all: () => componentRegistry.getAllVariants()
};
```

### 2. Performance Monitoring
```typescript
// Add performance monitoring
const ComponentSelector = () => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`ComponentSelector render time: ${endTime - startTime}ms`);
    };
  });
};
```

### 3. Error Boundary
```typescript
// Wrap component selector in error boundary
class ComponentSelectorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ComponentSelector error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h3>Something went wrong with the component library</h3>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Checklist

### Desktop Testing
- [ ] Components load correctly
- [ ] Search functionality works
- [ ] Filtering works
- [ ] Component selection works
- [ ] Preview images display
- [ ] Responsive grid layout

### Tablet Testing (768px - 1024px)
- [ ] Layout adapts properly
- [ ] Touch interactions work
- [ ] Components remain accessible
- [ ] Text remains readable
- [ ] Buttons are touch-friendly

### Mobile Testing (< 768px)
- [ ] Single column layout
- [ ] Touch targets are 44px minimum
- [ ] Scrolling works smoothly
- [ ] Search is accessible
- [ ] Filters work (consider mobile sheet)
- [ ] Performance is acceptable

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Quick Fixes

### Immediate Solutions
```typescript
// 1. Force refresh component registry
const refreshRegistry = () => {
  window.location.reload();
};

// 2. Clear component cache
const clearCache = () => {
  localStorage.removeItem('component-cache');
  sessionStorage.clear();
};

// 3. Reset component state
const resetComponentState = () => {
  setSearchQuery('');
  setSelectedTags([]);
  setShowFilters(false);
};
```

### Emergency Fallback
```typescript
// If all else fails, provide fallback components
const fallbackComponents = [
  {
    id: 'fallback-hero',
    name: 'Basic Hero',
    description: 'Simple hero section',
    category: { id: 'hero', name: 'Hero' },
    tags: ['basic'],
    version: '1.0.0'
  }
];

const ComponentSelector = () => {
  const variants = componentRegistry.getVariants(activeCategory);
  const displayVariants = variants.length > 0 ? variants : fallbackComponents;
  
  return (
    // Component JSX using displayVariants
  );
};
```

This troubleshooting guide should help resolve most common issues with the component library system.