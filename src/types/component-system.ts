// Component System Type Definitions
export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: ComponentCategory;
  props: ComponentProps;
  styling: ComponentStyling;
  responsive: ResponsiveConfig;
  dependencies?: string[];
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

export interface ComponentProps {
  [key: string]: {
    type: 'text' | 'textarea' | 'image' | 'url' | 'select' | 'multiselect' | 'boolean' | 'number' | 'color' | 'array';
    label: string;
    required: boolean;
    defaultValue?: any;
    validation?: ValidationRule[];
    options?: SelectOption[];
    placeholder?: string;
    description?: string;
  };
}

export interface ComponentStyling {
  customizable: boolean;
  cssClasses: string[];
  customCSS?: string;
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

export interface PortfolioSection {
  id: string;
  type: SectionType;
  componentVariantId: string;
  order: number;
  isVisible: boolean;
  content: Record<string, any>;
  customStyling?: Partial<ComponentStyling>;
  responsiveOverrides?: Partial<ResponsiveConfig>;
}

export type SectionType = 
  | 'header' 
  | 'hero' 
  | 'about' 
  | 'skills' 
  | 'projects' 
  | 'experience' 
  | 'education' 
  | 'testimonials' 
  | 'contact' 
  | 'footer';

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  sections: PortfolioSection[];
  globalSettings: GlobalSettings;
  metadata: PortfolioMetadata;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastSavedAt: Date;
  autoSaveEnabled: boolean;
}

export interface GlobalSettings {
  theme: {
    colorScheme: string;
    fontPairing: string;
    spacing: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  domain: {
    subdomain: string;
    customDomain?: string;
  };
  analytics: {
    googleAnalytics?: string;
    trackingEnabled: boolean;
  };
}

export interface PortfolioMetadata {
  views: number;
  lastViewed?: Date;
  version: number;
  backups: PortfolioBackup[];
}

export interface PortfolioBackup {
  id: string;
  timestamp: Date;
  sections: PortfolioSection[];
  reason: 'auto' | 'manual' | 'publish';
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'url' | 'email';
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

// Auto-save system types
export interface AutoSaveState {
  isEnabled: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveInterval: number; // milliseconds
  error: string | null;
}

// Component registry types
export interface ComponentRegistry {
  categories: ComponentCategory[];
  variants: Record<string, ComponentVariant[]>;
  register: (category: string, variant: ComponentVariant) => void;
  getVariants: (category: string) => ComponentVariant[];
  getVariant: (id: string) => ComponentVariant | null;
}