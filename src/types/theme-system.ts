// Core theme system types
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'creative' | 'professional' | 'artistic';
  preview: string;
  
  // Visual properties
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  effects: EffectsConfig;
  
  // Layout properties
  layout: LayoutConfig;
  components: ComponentStyles;
  
  // Metadata
  tags: string[];
  popularity: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  // Support for color variations
  variations: {
    [key: string]: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
}

export interface TypographyConfig {
  fontFamilies: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingConfig {
  scale: number; // Base scale multiplier
  sections: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  components: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface EffectsConfig {
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface LayoutConfig {
  maxWidth: string;
  containerPadding: string;
  sectionSpacing: string;
  gridGap: string;
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export interface ComponentStyles {
  button: ComponentVariants;
  card: ComponentVariants;
  input: ComponentVariants;
  badge: ComponentVariants;
  [key: string]: ComponentVariants;
}

export interface ComponentVariants {
  base: string;
  variants: {
    [variantName: string]: {
      [size: string]: string;
    };
  };
}

// Section system types
export interface SectionConfig {
  id: string;
  type: SectionType;
  name: string;
  description: string;
  icon: string;
  category: SectionCategory;
  
  // Content structure
  fields: SectionField[];
  layout: SectionLayout;
  
  // Customization options
  styleOptions: StyleOptions;
  
  // Constraints
  constraints: SectionConstraints;
  
  // Metadata
  isRequired: boolean;
  isCustomizable: boolean;
  order: number;
}

export type SectionType = 
  | 'hero'
  | 'about'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'testimonials'
  | 'contact'
  | 'custom';

export type SectionCategory = 
  | 'header'
  | 'content'
  | 'showcase'
  | 'footer'
  | 'custom';

export interface SectionField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  defaultValue?: any;
  options?: FieldOption[];
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'rich-text'
  | 'image'
  | 'url'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'color'
  | 'number'
  | 'array';

export interface FieldOption {
  label: string;
  value: string;
  icon?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SectionLayout {
  type: 'single-column' | 'two-column' | 'three-column' | 'grid' | 'masonry' | 'custom';
  alignment: 'left' | 'center' | 'right';
  spacing: 'tight' | 'normal' | 'loose';
  background: BackgroundConfig;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'pattern' | 'video';
  value: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

export interface StyleOptions {
  padding: string[];
  margin: string[];
  backgroundColor: string[];
  textColor: string[];
  borderRadius: string[];
  shadow: string[];
  animation: string[];
}

export interface SectionConstraints {
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;
  allowedPositions: number[];
  dependencies?: string[]; // Other sections this depends on
  conflicts?: string[]; // Sections that can't coexist
}

// Portfolio instance types
export interface PortfolioInstance {
  id: string;
  userId: string;
  name: string;
  slug: string;
  
  // Theme and layout
  themeId: string;
  customTheme?: Partial<ThemeConfig>;
  
  // Sections configuration
  sections: PortfolioSection[];
  
  // Global settings
  settings: PortfolioSettings;
  
  // Metadata
  isPublished: boolean;
  publishedAt?: Date;
  lastModified: Date;
  version: number;
}

export interface PortfolioSection {
  id: string;
  sectionConfigId: string;
  order: number;
  isVisible: boolean;
  
  // Content data
  content: Record<string, any>;
  
  // Style overrides
  styleOverrides?: Partial<StyleOptions>;
  layoutOverrides?: Partial<SectionLayout>;
  
  // Custom properties
  customProperties?: Record<string, any>;
}

export interface PortfolioSettings {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  analytics: {
    googleAnalytics?: string;
    facebookPixel?: string;
    customScripts?: string[];
  };
  domain: {
    customDomain?: string;
    subdomain: string;
  };
  privacy: {
    isPublic: boolean;
    passwordProtected: boolean;
    password?: string;
  };
}

// Customization interface types
export interface CustomizationState {
  selectedSection?: string;
  selectedElement?: string;
  mode: 'edit' | 'preview' | 'responsive';
  device: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  showSpacing: boolean;
}

export interface DragDropContext {
  draggedSection?: PortfolioSection;
  dropZone?: {
    position: number;
    isValid: boolean;
  };
  isDragging: boolean;
}