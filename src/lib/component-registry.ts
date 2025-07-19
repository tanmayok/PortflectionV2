// Component Registry System for Portfolio Builder
export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: ComponentCategory;
  props: Record<string, any>;
  styling: ComponentStyling;
  responsive: ResponsiveConfig;
  version: string;
  tags: string[];
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface ComponentStyling {
  customizable: boolean;
  cssClasses: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  spacing: {
    padding: string;
    margin: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: ComponentBreakpoint;
    tablet: ComponentBreakpoint;
    desktop: ComponentBreakpoint;
  };
}

export interface ComponentBreakpoint {
  hidden: boolean;
  styling: Partial<ComponentStyling>;
  layout: {
    width: string;
    height: string;
    display: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
  };
}

class PortfolioComponentRegistry {
  private _categories: ComponentCategory[] = [];
  private _variants: Record<string, ComponentVariant[]> = {};

  constructor() {
    this.initializeDefaultCategories();
    this.registerDefaultComponents();
  }

  private initializeDefaultCategories() {
    this._categories = [
      {
        id: 'hero',
        name: 'Hero Sections',
        description: 'Eye-catching header sections',
        icon: 'Star',
        order: 1
      },
      {
        id: 'about',
        name: 'About Sections',
        description: 'Personal introduction sections',
        icon: 'User',
        order: 2
      },
      {
        id: 'skills',
        name: 'Skills Sections',
        description: 'Showcase your abilities',
        icon: 'Award',
        order: 3
      },
      {
        id: 'projects',
        name: 'Project Sections',
        description: 'Display your work',
        icon: 'Briefcase',
        order: 4
      },
      {
        id: 'experience',
        name: 'Experience Sections',
        description: 'Professional timeline',
        icon: 'Clock',
        order: 5
      },
      {
        id: 'education',
        name: 'Education Sections',
        description: 'Academic background',
        icon: 'GraduationCap',
        order: 6
      },
      {
        id: 'contact',
        name: 'Contact Sections',
        description: 'Get in touch sections',
        icon: 'Mail',
        order: 7
      }
    ];
  }

  private registerDefaultComponents() {
    // Hero Section Components
    this.register('hero', {
      id: 'hero-minimal',
      name: 'Minimal Hero',
      description: 'Clean, centered layout with essential information',
      preview: '/previews/hero-minimal.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['minimal', 'clean', 'centered'],
      props: {
        name: { type: 'text', label: 'Full Name', required: true, defaultValue: 'Your Name' },
        title: { type: 'text', label: 'Professional Title', required: true, defaultValue: 'Your Title' },
        description: { type: 'textarea', label: 'Brief Description', required: true, defaultValue: 'Brief description about yourself' },
        profileImage: { type: 'image', label: 'Profile Image', required: false, defaultValue: '' },
        location: { type: 'text', label: 'Location', required: false, defaultValue: '' }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-minimal', 'text-center', 'py-20'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '5rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' } }
        }
      }
    });

    this.register('hero', {
      id: 'hero-split',
      name: 'Split Hero',
      description: 'Two-column layout with image and content',
      preview: '/previews/hero-split.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['split', 'two-column', 'image'],
      props: {
        name: { type: 'text', label: 'Full Name', required: true, defaultValue: 'Your Name' },
        title: { type: 'text', label: 'Professional Title', required: true, defaultValue: 'Your Title' },
        description: { type: 'textarea', label: 'Description', required: true, defaultValue: 'Tell your story' },
        profileImage: { type: 'image', label: 'Profile Image', required: true, defaultValue: '' },
        ctaText: { type: 'text', label: 'Call to Action', required: false, defaultValue: 'Get In Touch' }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-split', 'grid', 'grid-cols-2', 'gap-8'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '4rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'flex', flexDirection: 'column' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } }
        }
      }
    });

    // About Section Components
    this.register('about', {
      id: 'about-simple',
      name: 'Simple About',
      description: 'Clean text-based about section',
      preview: '/previews/about-simple.png',
      category: this._categories.find(c => c.id === 'about')!,
      version: '1.0.0',
      tags: ['simple', 'text', 'clean'],
      props: {
        title: { type: 'text', label: 'Section Title', required: true, defaultValue: 'About Me' },
        content: { type: 'textarea', label: 'About Content', required: true, defaultValue: 'Tell your story here...' },
        highlights: { type: 'array', label: 'Key Highlights', required: false, defaultValue: [] }
      },
      styling: {
        customizable: true,
        cssClasses: ['about-simple', 'py-16'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '4rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } }
        }
      }
    });

    // Skills Section Components
    this.register('skills', {
      id: 'skills-grid',
      name: 'Skills Grid',
      description: 'Grid layout with skill badges',
      preview: '/previews/skills-grid.png',
      category: this._categories.find(c => c.id === 'skills')!,
      version: '1.0.0',
      tags: ['grid', 'badges', 'organized'],
      props: {
        title: { type: 'text', label: 'Section Title', required: true, defaultValue: 'Skills' },
        skills: { type: 'array', label: 'Skills List', required: true, defaultValue: [] },
        categories: { type: 'array', label: 'Skill Categories', required: false, defaultValue: [] }
      },
      styling: {
        customizable: true,
        cssClasses: ['skills-grid', 'py-16'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '4rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } }
        }
      }
    });

    // Projects Section Components
    this.register('projects', {
      id: 'projects-grid',
      name: 'Project Grid',
      description: 'Clean grid layout for projects',
      preview: '/previews/projects-grid.png',
      category: this._categories.find(c => c.id === 'projects')!,
      version: '1.0.0',
      tags: ['grid', 'clean', 'showcase'],
      props: {
        title: { type: 'text', label: 'Section Title', required: true, defaultValue: 'Projects' },
        projects: { type: 'array', label: 'Projects List', required: true, defaultValue: [] }
      },
      styling: {
        customizable: true,
        cssClasses: ['projects-grid', 'py-16'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '4rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'grid' } }
        }
      }
    });

    // Contact Section Components
    this.register('contact', {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Full contact form with validation',
      preview: '/previews/contact-form.png',
      category: this._categories.find(c => c.id === 'contact')!,
      version: '1.0.0',
      tags: ['form', 'contact', 'interactive'],
      props: {
        title: { type: 'text', label: 'Section Title', required: true, defaultValue: 'Get In Touch' },
        email: { type: 'email', label: 'Your Email', required: true, defaultValue: '' },
        phone: { type: 'text', label: 'Phone Number', required: false, defaultValue: '' },
        message: { type: 'textarea', label: 'Contact Message', required: false, defaultValue: 'Feel free to reach out!' }
      },
      styling: {
        customizable: true,
        cssClasses: ['contact-form', 'py-16'],
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: { padding: '4rem 1rem', margin: '0' },
        typography: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5' }
      },
      responsive: {
        breakpoints: {
          mobile: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } },
          tablet: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } },
          desktop: { hidden: false, styling: {}, layout: { width: '100%', height: 'auto', display: 'block' } }
        }
      }
    });
  }

  register(categoryId: string, variant: ComponentVariant): void {
    if (!this._variants[categoryId]) {
      this._variants[categoryId] = [];
    }
    this._variants[categoryId].push(variant);
  }

  getVariants(categoryId: string): ComponentVariant[] {
    return this._variants[categoryId] || [];
  }

  getVariant(variantId: string): ComponentVariant | null {
    for (const variants of Object.values(this._variants)) {
      const variant = variants.find(v => v.id === variantId);
      if (variant) return variant;
    }
    return null;
  }

  getAllVariants(): ComponentVariant[] {
    return Object.values(this._variants).flat();
  }

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

  get categories(): ComponentCategory[] {
    return [...this._categories];
  }

  get variants(): Record<string, ComponentVariant[]> {
    return { ...this._variants };
  }
}

// Export singleton instance
export const componentRegistry = new PortfolioComponentRegistry();