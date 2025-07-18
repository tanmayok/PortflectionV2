# Component Addition Guide

## Overview
This guide explains how to add new components to the portfolio builder's component library system.

## Component System Architecture

### File Structure
```
src/
├── lib/
│   └── component-registry.ts          # Main registry system
├── types/
│   └── component-system.ts            # Type definitions
├── components/
│   └── portfolio-builder/
│       ├── ComponentSelector.tsx      # Component selection UI
│       └── component-variants/        # Individual component implementations
│           ├── hero/
│           │   ├── HeroMinimal.tsx
│           │   ├── HeroSplit.tsx
│           │   └── HeroVideo.tsx
│           ├── about/
│           │   ├── AboutSimple.tsx
│           │   └── AboutTimeline.tsx
│           └── ...
```

## Step-by-Step Component Addition Process

### 1. Define Component Variant
Add your component to the registry in `src/lib/component-registry.ts`:

```typescript
// Example: Adding a new hero component variant
this.register('hero', {
  id: 'hero-animated',
  name: 'Animated Hero',
  description: 'Hero section with smooth animations',
  preview: '/previews/hero-animated.png',
  category: this._categories.find(c => c.id === 'hero')!,
  version: '1.0.0',
  tags: ['animated', 'modern', 'interactive'],
  
  // Define component props
  props: {
    title: {
      type: 'text',
      label: 'Hero Title',
      required: true,
      defaultValue: 'Welcome',
      placeholder: 'Enter hero title'
    },
    subtitle: {
      type: 'textarea',
      label: 'Hero Subtitle',
      required: false,
      defaultValue: 'Your subtitle here',
      placeholder: 'Enter subtitle'
    },
    animationType: {
      type: 'select',
      label: 'Animation Type',
      required: false,
      defaultValue: 'fadeIn',
      options: [
        { label: 'Fade In', value: 'fadeIn' },
        { label: 'Slide Up', value: 'slideUp' },
        { label: 'Scale', value: 'scale' }
      ]
    }
  },
  
  // Define styling options
  styling: {
    customizable: true,
    cssClasses: ['hero-animated', 'min-h-screen', 'flex', 'items-center'],
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#1e293b'
    },
    spacing: {
      padding: '4rem 1rem',
      margin: '0'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.5'
    }
  },
  
  // Define responsive behavior
  responsive: {
    breakpoints: {
      mobile: {
        hidden: false,
        styling: {
          spacing: {
            padding: '2rem 1rem',
            margin: '0'
          }
        },
        layout: {
          width: '100%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      tablet: {
        hidden: false,
        styling: {
          spacing: {
            padding: '3rem 1rem',
            margin: '0'
          }
        },
        layout: {
          width: '100%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      desktop: {
        hidden: false,
        styling: {},
        layout: {
          width: '100%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }
      }
    }
  }
});
```

### 2. Create Component Implementation (Optional)
If you need a custom React component, create it in the appropriate folder:

```typescript
// src/components/portfolio-builder/component-variants/hero/HeroAnimated.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface HeroAnimatedProps {
  title: string;
  subtitle?: string;
  animationType: 'fadeIn' | 'slideUp' | 'scale';
  styling: any;
}

export const HeroAnimated: React.FC<HeroAnimatedProps> = ({
  title,
  subtitle,
  animationType,
  styling
}) => {
  const animations = {
    fadeIn: { opacity: [0, 1], transition: { duration: 1 } },
    slideUp: { y: [50, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    scale: { scale: [0.8, 1], opacity: [0, 1], transition: { duration: 0.6 } }
  };

  return (
    <motion.section
      className="hero-animated min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: styling.colorScheme.background,
        color: styling.colorScheme.text,
        padding: styling.spacing.padding
      }}
      initial={{ opacity: 0 }}
      animate={animations[animationType]}
    >
      <div className="text-center max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          style={{
            color: styling.colorScheme.primary,
            fontFamily: styling.typography.fontFamily
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl"
            style={{
              color: styling.colorScheme.secondary,
              fontFamily: styling.typography.fontFamily
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
};
```

### 3. Add Preview Image
Add a preview image to the `public/previews/` directory:
- File name should match the component ID (e.g., `hero-animated.png`)
- Recommended size: 400x300px
- Format: PNG or JPG

### 4. Update Categories (if needed)
If adding a new category, update the `initializeDefaultCategories()` method:

```typescript
private initializeDefaultCategories() {
  this._categories = [
    // ... existing categories
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Client feedback and reviews',
      icon: 'MessageSquare',
      order: 8
    }
  ];
}
```

## Component Properties Reference

### Supported Prop Types
- `text`: Single line text input
- `textarea`: Multi-line text input
- `image`: Image upload/URL input
- `url`: URL input with validation
- `select`: Dropdown selection
- `multiselect`: Multiple selection
- `boolean`: Checkbox/toggle
- `number`: Numeric input
- `color`: Color picker
- `array`: Dynamic array of items

### Styling Configuration
```typescript
styling: {
  customizable: true,                    // Allow user customization
  cssClasses: ['component-class'],       // CSS classes to apply
  colorScheme: {                         // Default colors
    primary: '#color',
    secondary: '#color',
    accent: '#color',
    background: '#color',
    text: '#color'
  },
  spacing: {                             // Default spacing
    padding: 'value',
    margin: 'value'
  },
  typography: {                          // Default typography
    fontFamily: 'font-name',
    fontSize: 'size',
    fontWeight: 'weight',
    lineHeight: 'height'
  }
}
```

### Responsive Configuration
```typescript
responsive: {
  breakpoints: {
    mobile: {
      hidden: false,                     // Show/hide on mobile
      styling: { /* mobile-specific styles */ },
      layout: {                          // Layout properties
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }
    },
    tablet: { /* tablet configuration */ },
    desktop: { /* desktop configuration */ }
  }
}
```

## Best Practices

### 1. Naming Conventions
- Component IDs: `category-descriptive-name` (e.g., `hero-minimal`, `about-timeline`)
- Component names: Descriptive and user-friendly
- Tags: Lowercase, descriptive keywords

### 2. Responsive Design
- Always define responsive behavior for all breakpoints
- Use mobile-first approach
- Test on actual devices when possible

### 3. Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements
- Provide alt text for images

### 4. Performance
- Optimize images and assets
- Use lazy loading for heavy components
- Minimize bundle size impact

### 5. Documentation
- Provide clear descriptions
- Include usage examples
- Document any special requirements

## Testing New Components

### 1. Component Registry Test
```typescript
// Test that component is registered
const variant = componentRegistry.getVariant('your-component-id');
console.log('Component registered:', variant !== null);
```

### 2. Visual Testing
1. Navigate to `/dashboard/portfolio-builder`
2. Select the appropriate category
3. Verify component appears in the list
4. Test component selection and preview
5. Test responsive behavior

### 3. Integration Testing
1. Add component to a portfolio
2. Test editing functionality
3. Test save/load functionality
4. Test publish workflow

## Troubleshooting

### Component Not Appearing
1. Check component ID is unique
2. Verify category exists
3. Check for JavaScript errors in console
4. Ensure component is registered in constructor

### Preview Not Working
1. Verify preview image exists
2. Check image path is correct
3. Ensure image is accessible

### Responsive Issues
1. Test on actual devices
2. Use browser dev tools
3. Check CSS media queries
4. Verify responsive configuration

## Advanced Features

### Custom Validation
```typescript
props: {
  email: {
    type: 'text',
    label: 'Email',
    required: true,
    validation: [
      { type: 'email', message: 'Please enter a valid email' }
    ]
  }
}
```

### Conditional Props
```typescript
props: {
  showImage: {
    type: 'boolean',
    label: 'Show Image',
    defaultValue: false
  },
  imageUrl: {
    type: 'image',
    label: 'Image URL',
    required: false,
    // Only show if showImage is true
    conditional: { field: 'showImage', value: true }
  }
}
```

### Component Dependencies
```typescript
{
  id: 'advanced-component',
  // ... other properties
  dependencies: ['react-motion', 'framer-motion'], // External dependencies
  constraints: {
    minHeight: '400px',
    maxSections: 1 // Only allow one instance
  }
}
```

This guide provides everything needed to add new components to the portfolio builder system. The modular architecture makes it easy to extend functionality while maintaining consistency and performance.