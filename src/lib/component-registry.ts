import { ComponentRegistry, ComponentVariant, ComponentCategory } from '@/types/component-system';

class PortfolioComponentRegistry implements ComponentRegistry {
  private _categories: ComponentCategory[] = [];
  private _variants: Record<string, ComponentVariant[]> = {};

  constructor() {
    this.initializeDefaultCategories();
    this.registerDefaultComponents();
  }

  get categories(): ComponentCategory[] {
    return this._categories;
  }

  get variants(): Record<string, ComponentVariant[]> {
    return this._variants;
  }

  private initializeDefaultCategories() {
    this._categories = [
      {
        id: 'header',
        name: 'Header',
        description: 'Navigation and branding components',
        icon: 'Layout',
        order: 1
      },
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Main introduction and call-to-action sections',
        icon: 'Star',
        order: 2
      },
      {
        id: 'about',
        name: 'About',
        description: 'Personal introduction and bio sections',
        icon: 'User',
        order: 3
      },
      {
        id: 'skills',
        name: 'Skills',
        description: 'Technical and professional skills display',
        icon: 'Award',
        order: 4
      },
      {
        id: 'projects',
        name: 'Projects',
        description: 'Portfolio work and case studies',
        icon: 'Briefcase',
        order: 5
      },
      {
        id: 'experience',
        name: 'Experience',
        description: 'Work history and professional timeline',
        icon: 'Clock',
        order: 6
      },
      {
        id: 'education',
        name: 'Education',
        description: 'Academic background and certifications',
        icon: 'GraduationCap',
        order: 7
      },
      {
        id: 'testimonials',
        name: 'Testimonials',
        description: 'Client feedback and recommendations',
        icon: 'MessageSquare',
        order: 8
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Contact forms and information',
        icon: 'Mail',
        order: 9
      },
      {
        id: 'footer',
        name: 'Footer',
        description: 'Footer content and links',
        icon: 'Minus',
        order: 10
      }
    ];
  }

  private registerDefaultComponents() {
    // Hero Section Variants
    this.register('hero', {
      id: 'hero-minimal',
      name: 'Minimal Hero',
      description: 'Clean, text-focused hero section',
      preview: '/previews/hero-minimal.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['minimal', 'text', 'clean'],
      props: {
        name: {
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Enter your full name'
        },
        title: {
          type: 'text',
          label: 'Professional Title',
          required: true,
          defaultValue: 'Your Title',
          placeholder: 'e.g. Full Stack Developer'
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle/Bio',
          required: false,
          defaultValue: 'Brief description about yourself',
          placeholder: 'Tell visitors about yourself...'
        },
        ctaText: {
          type: 'text',
          label: 'Call to Action Text',
          required: false,
          defaultValue: 'Get In Touch',
          placeholder: 'Button text'
        },
        ctaUrl: {
          type: 'url',
          label: 'Call to Action URL',
          required: false,
          defaultValue: '#contact',
          placeholder: 'https://example.com or #section'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-minimal', 'text-center', 'py-20'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: {
          padding: '5rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
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
          tablet: {
            hidden: false,
            styling: {
              spacing: {
                padding: '4rem 2rem',
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

    this.register('hero', {
      id: 'hero-split',
      name: 'Split Hero',
      description: 'Hero with image and text side by side',
      preview: '/previews/hero-split.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['split', 'image', 'modern'],
      props: {
        name: {
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Enter your full name'
        },
        title: {
          type: 'text',
          label: 'Professional Title',
          required: true,
          defaultValue: 'Your Title',
          placeholder: 'e.g. Full Stack Developer'
        },
        description: {
          type: 'textarea',
          label: 'Description',
          required: true,
          defaultValue: 'Your professional description',
          placeholder: 'Describe your expertise...'
        },
        profileImage: {
          type: 'image',
          label: 'Profile Image',
          required: false,
          defaultValue: '/placeholder-avatar.jpg',
          placeholder: 'Upload your photo'
        },
        ctaText: {
          type: 'text',
          label: 'Primary CTA',
          required: false,
          defaultValue: 'View My Work',
          placeholder: 'Button text'
        },
        secondaryCtaText: {
          type: 'text',
          label: 'Secondary CTA',
          required: false,
          defaultValue: 'Contact Me',
          placeholder: 'Secondary button text'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-split', 'grid', 'lg:grid-cols-2', 'gap-8', 'items-center', 'py-20'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: {
          padding: '5rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    this.register('hero', {
      id: 'hero-video',
      name: 'Video Hero',
      description: 'Hero section with background video',
      preview: '/previews/hero-video.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['video', 'dynamic', 'modern'],
      props: {
        name: {
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Enter your full name'
        },
        title: {
          type: 'text',
          label: 'Professional Title',
          required: true,
          defaultValue: 'Your Title',
          placeholder: 'e.g. Creative Director'
        },
        videoUrl: {
          type: 'url',
          label: 'Background Video URL',
          required: false,
          defaultValue: '/placeholder-video.mp4',
          placeholder: 'Video file URL'
        },
        overlayOpacity: {
          type: 'number',
          label: 'Overlay Opacity',
          required: false,
          defaultValue: 0.5,
          placeholder: '0.0 - 1.0'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-video', 'relative', 'min-h-screen', 'flex', 'items-center'],
        colorScheme: {
          primary: '#ffffff',
          secondary: '#f1f5f9',
          accent: '#3b82f6',
          background: '#000000',
          text: '#ffffff'
        },
        spacing: {
          padding: '0',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }
          }
        }
      }
    });

    // About Section Variants
    this.register('about', {
      id: 'about-simple',
      name: 'Simple About',
      description: 'Clean about section with text and image',
      preview: '/previews/about-simple.png',
      category: this._categories.find(c => c.id === 'about')!,
      version: '1.0.0',
      tags: ['simple', 'clean', 'text'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'About Me',
          placeholder: 'Section title'
        },
        content: {
          type: 'textarea',
          label: 'About Content',
          required: true,
          defaultValue: 'Tell your story here...',
          placeholder: 'Write about yourself, your background, and what drives you...'
        },
        image: {
          type: 'image',
          label: 'About Image',
          required: false,
          defaultValue: '/placeholder-about.jpg',
          placeholder: 'Upload an image'
        },
        highlights: {
          type: 'array',
          label: 'Key Highlights',
          required: false,
          defaultValue: ['Highlight 1', 'Highlight 2', 'Highlight 3'],
          placeholder: 'Add key points about yourself'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['about-simple', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#f8fafc',
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
          lineHeight: '1.6'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    this.register('about', {
      id: 'about-timeline',
      name: 'Timeline About',
      description: 'About section with timeline layout',
      preview: '/previews/about-timeline.png',
      category: this._categories.find(c => c.id === 'about')!,
      version: '1.0.0',
      tags: ['timeline', 'story', 'journey'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'My Journey',
          placeholder: 'Section title'
        },
        milestones: {
          type: 'array',
          label: 'Timeline Milestones',
          required: true,
          defaultValue: [
            { year: '2020', title: 'Started Career', description: 'Began my professional journey' },
            { year: '2022', title: 'Major Achievement', description: 'Reached significant milestone' },
            { year: '2024', title: 'Current Role', description: 'Leading innovative projects' }
          ],
          placeholder: 'Add timeline milestones'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['about-timeline', 'py-16'],
        colorScheme: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#34d399',
          background: '#ecfdf5',
          text: '#064e3b'
        },
        spacing: {
          padding: '4rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.6'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
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

    // Skills Section Variants
    this.register('skills', {
      id: 'skills-grid',
      name: 'Skills Grid',
      description: 'Grid layout for skills with proficiency levels',
      preview: '/previews/skills-grid.png',
      category: this._categories.find(c => c.id === 'skills')!,
      version: '1.0.0',
      tags: ['grid', 'proficiency', 'visual'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Skills & Expertise',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: 'Technologies and tools I work with',
          placeholder: 'Optional subtitle'
        },
        skills: {
          type: 'array',
          label: 'Skills List',
          required: true,
          defaultValue: [
            { name: 'JavaScript', level: 90, category: 'Frontend' },
            { name: 'React', level: 85, category: 'Frontend' },
            { name: 'Node.js', level: 80, category: 'Backend' },
            { name: 'Python', level: 75, category: 'Backend' }
          ],
          placeholder: 'Add your skills'
        },
        showProficiency: {
          type: 'boolean',
          label: 'Show Proficiency Levels',
          required: false,
          defaultValue: true,
          description: 'Display skill proficiency bars'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['skills-grid', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    this.register('skills', {
      id: 'skills-badges',
      name: 'Skills Badges',
      description: 'Badge-style skill display',
      preview: '/previews/skills-badges.png',
      category: this._categories.find(c => c.id === 'skills')!,
      version: '1.0.0',
      tags: ['badges', 'simple', 'clean'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Technical Skills',
          placeholder: 'Section title'
        },
        skills: {
          type: 'array',
          label: 'Skills List',
          required: true,
          defaultValue: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
          placeholder: 'Add your skills'
        },
        badgeStyle: {
          type: 'select',
          label: 'Badge Style',
          required: false,
          defaultValue: 'rounded',
          options: [
            { label: 'Rounded', value: 'rounded' },
            { label: 'Square', value: 'square' },
            { label: 'Pill', value: 'pill' }
          ]
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['skills-badges', 'py-16'],
        colorScheme: {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#c4b5fd',
          background: '#faf5ff',
          text: '#581c87'
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
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

    // Projects Section Variants
    this.register('projects', {
      id: 'projects-cards',
      name: 'Project Cards',
      description: 'Card-based project showcase',
      preview: '/previews/projects-cards.png',
      category: this._categories.find(c => c.id === 'projects')!,
      version: '1.0.0',
      tags: ['cards', 'showcase', 'grid'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Featured Projects',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: 'Some of my recent work',
          placeholder: 'Optional subtitle'
        },
        projects: {
          type: 'array',
          label: 'Projects',
          required: true,
          defaultValue: [
            {
              title: 'Project 1',
              description: 'Project description...',
              image: '/placeholder-project.jpg',
              technologies: ['React', 'Node.js'],
              liveUrl: 'https://example.com',
              githubUrl: 'https://github.com/user/project'
            }
          ],
          placeholder: 'Add your projects'
        },
        showTechnologies: {
          type: 'boolean',
          label: 'Show Technologies',
          required: false,
          defaultValue: true,
          description: 'Display technology tags'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['projects-cards', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#f8fafc',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    this.register('projects', {
      id: 'projects-masonry',
      name: 'Masonry Projects',
      description: 'Pinterest-style masonry layout',
      preview: '/previews/projects-masonry.png',
      category: this._categories.find(c => c.id === 'projects')!,
      version: '1.0.0',
      tags: ['masonry', 'pinterest', 'dynamic'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Portfolio Gallery',
          placeholder: 'Section title'
        },
        projects: {
          type: 'array',
          label: 'Projects',
          required: true,
          defaultValue: [
            {
              title: 'Creative Project',
              description: 'A creative showcase...',
              image: '/placeholder-project-1.jpg',
              category: 'Design'
            },
            {
              title: 'Technical Project',
              description: 'A technical implementation...',
              image: '/placeholder-project-2.jpg',
              category: 'Development'
            }
          ],
          placeholder: 'Add your projects'
        },
        columns: {
          type: 'select',
          label: 'Number of Columns',
          required: false,
          defaultValue: '3',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' }
          ]
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['projects-masonry', 'py-16'],
        colorScheme: {
          primary: '#dc2626',
          secondary: '#ef4444',
          accent: '#fca5a5',
          background: '#fef2f2',
          text: '#7f1d1d'
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    // Contact Section Variants
    this.register('contact', {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Simple contact form with social links',
      preview: '/previews/contact-form.png',
      category: this._categories.find(c => c.id === 'contact')!,
      version: '1.0.0',
      tags: ['form', 'contact', 'social'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Get In Touch',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: "Let's work together",
          placeholder: 'Optional subtitle'
        },
        email: {
          type: 'text',
          label: 'Email Address',
          required: true,
          defaultValue: 'your.email@example.com',
          placeholder: 'Your email address'
        },
        phone: {
          type: 'text',
          label: 'Phone Number',
          required: false,
          defaultValue: '+1 (555) 123-4567',
          placeholder: 'Your phone number'
        },
        socialLinks: {
          type: 'array',
          label: 'Social Links',
          required: false,
          defaultValue: [
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile' },
            { platform: 'GitHub', url: 'https://github.com/yourusername' },
            { platform: 'Twitter', url: 'https://twitter.com/yourusername' }
          ],
          placeholder: 'Add your social media links'
        },
        showForm: {
          type: 'boolean',
          label: 'Show Contact Form',
          required: false,
          defaultValue: true,
          description: 'Display contact form for visitors'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['contact-form', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    this.register('contact', {
      id: 'contact-minimal',
      name: 'Minimal Contact',
      description: 'Clean contact section with just essentials',
      preview: '/previews/contact-minimal.png',
      category: this._categories.find(c => c.id === 'contact')!,
      version: '1.0.0',
      tags: ['minimal', 'clean', 'simple'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Contact',
          placeholder: 'Section title'
        },
        email: {
          type: 'text',
          label: 'Email Address',
          required: true,
          defaultValue: 'hello@example.com',
          placeholder: 'Your email address'
        },
        message: {
          type: 'textarea',
          label: 'Contact Message',
          required: false,
          defaultValue: 'Feel free to reach out for collaborations or just a friendly hello!',
          placeholder: 'Your contact message'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['contact-minimal', 'py-16', 'text-center'],
        colorScheme: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#34d399',
          background: '#ecfdf5',
          text: '#064e3b'
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
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

    // Experience Section Variants
    this.register('experience', {
      id: 'experience-timeline',
      name: 'Experience Timeline',
      description: 'Timeline layout for work experience',
      preview: '/previews/experience-timeline.png',
      category: this._categories.find(c => c.id === 'experience')!,
      version: '1.0.0',
      tags: ['timeline', 'professional', 'chronological'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Work Experience',
          placeholder: 'Section title'
        },
        experiences: {
          type: 'array',
          label: 'Work Experience',
          required: true,
          defaultValue: [
            {
              company: 'Tech Company',
              position: 'Senior Developer',
              duration: '2022 - Present',
              description: 'Leading development of innovative solutions...'
            }
          ],
          placeholder: 'Add your work experience'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['experience-timeline', 'py-16'],
        colorScheme: {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#c4b5fd',
          background: '#faf5ff',
          text: '#581c87'
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
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

    // Header Section Variants
    this.register('header', {
      id: 'header-navigation',
      name: 'Navigation Header',
      description: 'Header with navigation menu',
      preview: '/previews/header-navigation.png',
      category: this._categories.find(c => c.id === 'header')!,
      version: '1.0.0',
      tags: ['navigation', 'menu', 'header'],
      props: {
        logo: {
          type: 'text',
          label: 'Logo Text',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Your name or brand'
        },
        menuItems: {
          type: 'array',
          label: 'Menu Items',
          required: true,
          defaultValue: [
            { label: 'About', url: '#about' },
            { label: 'Projects', url: '#projects' },
            { label: 'Contact', url: '#contact' }
          ],
          placeholder: 'Add navigation items'
        },
        ctaButton: {
          type: 'text',
          label: 'CTA Button Text',
          required: false,
          defaultValue: 'Hire Me',
          placeholder: 'Call to action button'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['header-navigation', 'sticky', 'top-0', 'z-50'],
        colorScheme: {
          primary: '#1f2937',
          secondary: '#374151',
          accent: '#3b82f6',
          background: '#ffffff',
          text: '#1f2937'
        },
        spacing: {
          padding: '1rem 2rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '500',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row'
            }
          }
        }
      }
    });

    // Footer Section Variants
    this.register('footer', {
      id: 'footer-simple',
      name: 'Simple Footer',
      description: 'Clean footer with social links',
      preview: '/previews/footer-simple.png',
      category: this._categories.find(c => c.id === 'footer')!,
      version: '1.0.0',
      tags: ['simple', 'social', 'clean'],
      props: {
        copyrightText: {
          type: 'text',
          label: 'Copyright Text',
          required: true,
          defaultValue: '© 2024 Your Name. All rights reserved.',
          placeholder: 'Copyright notice'
        },
        socialLinks: {
          type: 'array',
          label: 'Social Links',
          required: false,
          defaultValue: [
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'GitHub', url: 'https://github.com' },
            { platform: 'Twitter', url: 'https://twitter.com' }
          ],
          placeholder: 'Add social media links'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['footer-simple', 'py-8', 'border-t'],
        colorScheme: {
          primary: '#6b7280',
          secondary: '#9ca3af',
          accent: '#3b82f6',
          background: '#f9fafb',
          text: '#374151'
        },
        spacing: {
          padding: '2rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row'
            }
          }
        }
      }
    });
    // Hero Section Variants
    this.register('hero', {
      id: 'hero-minimal',
      name: 'Minimal Hero',
      description: 'Clean, text-focused hero section',
      preview: '/previews/hero-minimal.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['minimal', 'text', 'clean'],
      props: {
        name: {
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Enter your full name'
        },
        title: {
          type: 'text',
          label: 'Professional Title',
          required: true,
          defaultValue: 'Your Title',
          placeholder: 'e.g. Full Stack Developer'
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle/Bio',
          required: false,
          defaultValue: 'Brief description about yourself',
          placeholder: 'Tell visitors about yourself...'
        },
        ctaText: {
          type: 'text',
          label: 'Call to Action Text',
          required: false,
          defaultValue: 'Get In Touch',
          placeholder: 'Button text'
        },
        ctaUrl: {
          type: 'url',
          label: 'Call to Action URL',
          required: false,
          defaultValue: '#contact',
          placeholder: 'https://example.com or #section'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-minimal', 'text-center', 'py-20'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: {
          padding: '5rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
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
          tablet: {
            hidden: false,
            styling: {
              spacing: {
                padding: '4rem 2rem',
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

    this.register('hero', {
      id: 'hero-split',
      name: 'Split Hero',
      description: 'Hero with image and text side by side',
      preview: '/previews/hero-split.png',
      category: this._categories.find(c => c.id === 'hero')!,
      version: '1.0.0',
      tags: ['split', 'image', 'modern'],
      props: {
        name: {
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'Your Name',
          placeholder: 'Enter your full name'
        },
        title: {
          type: 'text',
          label: 'Professional Title',
          required: true,
          defaultValue: 'Your Title',
          placeholder: 'e.g. Full Stack Developer'
        },
        description: {
          type: 'textarea',
          label: 'Description',
          required: true,
          defaultValue: 'Your professional description',
          placeholder: 'Describe your expertise...'
        },
        profileImage: {
          type: 'image',
          label: 'Profile Image',
          required: false,
          defaultValue: '/placeholder-avatar.jpg',
          placeholder: 'Upload your photo'
        },
        ctaText: {
          type: 'text',
          label: 'Primary CTA',
          required: false,
          defaultValue: 'View My Work',
          placeholder: 'Button text'
        },
        secondaryCtaText: {
          type: 'text',
          label: 'Secondary CTA',
          required: false,
          defaultValue: 'Contact Me',
          placeholder: 'Secondary button text'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['hero-split', 'grid', 'lg:grid-cols-2', 'gap-8', 'items-center', 'py-20'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#ffffff',
          text: '#1e293b'
        },
        spacing: {
          padding: '5rem 1rem',
          margin: '0'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    // About Section Variants
    this.register('about', {
      id: 'about-simple',
      name: 'Simple About',
      description: 'Clean about section with text and image',
      preview: '/previews/about-simple.png',
      category: this._categories.find(c => c.id === 'about')!,
      version: '1.0.0',
      tags: ['simple', 'clean', 'text'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'About Me',
          placeholder: 'Section title'
        },
        content: {
          type: 'textarea',
          label: 'About Content',
          required: true,
          defaultValue: 'Tell your story here...',
          placeholder: 'Write about yourself, your background, and what drives you...'
        },
        image: {
          type: 'image',
          label: 'About Image',
          required: false,
          defaultValue: '/placeholder-about.jpg',
          placeholder: 'Upload an image'
        },
        highlights: {
          type: 'array',
          label: 'Key Highlights',
          required: false,
          defaultValue: ['Highlight 1', 'Highlight 2', 'Highlight 3'],
          placeholder: 'Add key points about yourself'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['about-simple', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#f8fafc',
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
          lineHeight: '1.6'
        }
      },
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    // Skills Section Variants
    this.register('skills', {
      id: 'skills-grid',
      name: 'Skills Grid',
      description: 'Grid layout for skills with proficiency levels',
      preview: '/previews/skills-grid.png',
      category: this._categories.find(c => c.id === 'skills')!,
      version: '1.0.0',
      tags: ['grid', 'proficiency', 'visual'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Skills & Expertise',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: 'Technologies and tools I work with',
          placeholder: 'Optional subtitle'
        },
        skills: {
          type: 'array',
          label: 'Skills List',
          required: true,
          defaultValue: [
            { name: 'JavaScript', level: 90, category: 'Frontend' },
            { name: 'React', level: 85, category: 'Frontend' },
            { name: 'Node.js', level: 80, category: 'Backend' },
            { name: 'Python', level: 75, category: 'Backend' }
          ],
          placeholder: 'Add your skills'
        },
        showProficiency: {
          type: 'boolean',
          label: 'Show Proficiency Levels',
          required: false,
          defaultValue: true,
          description: 'Display skill proficiency bars'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['skills-grid', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    // Projects Section Variants
    this.register('projects', {
      id: 'projects-cards',
      name: 'Project Cards',
      description: 'Card-based project showcase',
      preview: '/previews/projects-cards.png',
      category: this._categories.find(c => c.id === 'projects')!,
      version: '1.0.0',
      tags: ['cards', 'showcase', 'grid'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Featured Projects',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: 'Some of my recent work',
          placeholder: 'Optional subtitle'
        },
        projects: {
          type: 'array',
          label: 'Projects',
          required: true,
          defaultValue: [
            {
              title: 'Project 1',
              description: 'Project description...',
              image: '/placeholder-project.jpg',
              technologies: ['React', 'Node.js'],
              liveUrl: 'https://example.com',
              githubUrl: 'https://github.com/user/project'
            }
          ],
          placeholder: 'Add your projects'
        },
        showTechnologies: {
          type: 'boolean',
          label: 'Show Technologies',
          required: false,
          defaultValue: true,
          description: 'Display technology tags'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['projects-cards', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#8b5cf6',
          background: '#f8fafc',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
        }
      }
    });

    // Contact Section Variants
    this.register('contact', {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Simple contact form with social links',
      preview: '/previews/contact-form.png',
      category: this._categories.find(c => c.id === 'contact')!,
      version: '1.0.0',
      tags: ['form', 'contact', 'social'],
      props: {
        heading: {
          type: 'text',
          label: 'Section Heading',
          required: true,
          defaultValue: 'Get In Touch',
          placeholder: 'Section title'
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          required: false,
          defaultValue: "Let's work together",
          placeholder: 'Optional subtitle'
        },
        email: {
          type: 'text',
          label: 'Email Address',
          required: true,
          defaultValue: 'your.email@example.com',
          placeholder: 'Your email address'
        },
        phone: {
          type: 'text',
          label: 'Phone Number',
          required: false,
          defaultValue: '+1 (555) 123-4567',
          placeholder: 'Your phone number'
        },
        socialLinks: {
          type: 'array',
          label: 'Social Links',
          required: false,
          defaultValue: [
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile' },
            { platform: 'GitHub', url: 'https://github.com/yourusername' },
            { platform: 'Twitter', url: 'https://twitter.com/yourusername' }
          ],
          placeholder: 'Add your social media links'
        },
        showForm: {
          type: 'boolean',
          label: 'Show Contact Form',
          required: false,
          defaultValue: true,
          description: 'Display contact form for visitors'
        }
      },
      styling: {
        customizable: true,
        cssClasses: ['contact-form', 'py-16'],
        colorScheme: {
          primary: '#2563eb',
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
      responsive: {
        breakpoints: {
          mobile: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }
          },
          tablet: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          },
          desktop: {
            hidden: false,
            styling: {},
            layout: {
              width: '100%',
              height: 'auto',
              display: 'grid'
            }
          }
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
    for (const categoryVariants of Object.values(this._variants)) {
      const variant = categoryVariants.find(v => v.id === variantId);
      if (variant) return variant;
    }
    return null;
  }

  getAllVariants(): ComponentVariant[] {
    return Object.values(this._variants).flat();
  }

  searchVariants(query: string, categoryId?: string): ComponentVariant[] {
    const variants = categoryId ? this.getVariants(categoryId) : this.getAllVariants();
    const lowercaseQuery = query.toLowerCase();
    
    return variants.filter(variant => 
      variant.name.toLowerCase().includes(lowercaseQuery) ||
      variant.description.toLowerCase().includes(lowercaseQuery) ||
      variant.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getAllVariants(): ComponentVariant[] {
    return Object.values(this._variants).flat();
  }

  searchVariants(query: string, categoryId?: string): ComponentVariant[] {
    const variants = categoryId ? this.getVariants(categoryId) : this.getAllVariants();
    const lowercaseQuery = query.toLowerCase();
    
    return variants.filter(variant => 
      variant.name.toLowerCase().includes(lowercaseQuery) ||
      variant.description.toLowerCase().includes(lowercaseQuery) ||
      variant.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// Singleton instance
export const componentRegistry = new PortfolioComponentRegistry();