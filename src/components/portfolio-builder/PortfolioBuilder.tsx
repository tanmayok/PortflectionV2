"use client";

import { useState, useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Palette,
  LayoutDashboard,
  Eye,
  Settings,
  Save,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import { SectionBuilder } from "./SectionBuilder";
import { CustomizationPanel } from "./CustomizationPanel";
import { PortfolioPreview } from "./PortfolioPreview";
import {
  ThemeConfig,
  PortfolioInstance,
  PortfolioSection,
  SectionConfig,
  CustomizationState,
} from "@/types/theme-system";

// Mock data - in real implementation, these would come from APIs
const mockThemes: ThemeConfig[] = [
  {
    id: "minimal-blue",
    name: "Minimal Blue",
    description: "Clean and professional design with blue accents",
    category: "minimal",
    preview: "/themes/minimal-blue.png",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#8b5cf6",
      background: "#ffffff",
      surface: "#f8fafc",
      text: {
        primary: "#1e293b",
        secondary: "#475569",
        muted: "#94a3b8",
      },
      border: "#e2e8f0",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      variations: {},
    },
    typography: {
      fontFamilies: {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      fontSizes: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
      },
      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
      letterSpacing: {
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
      },
    },
    spacing: {
      scale: 1,
      sections: {
        xs: "2rem",
        sm: "3rem",
        md: "4rem",
        lg: "6rem",
        xl: "8rem",
      },
      components: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    effects: {
      shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      animations: {
        duration: {
          fast: "150ms",
          normal: "300ms",
          slow: "500ms",
        },
        easing: {
          ease: "ease",
          easeIn: "ease-in",
          easeOut: "ease-out",
          easeInOut: "ease-in-out",
        },
      },
      blur: {
        sm: "4px",
        md: "8px",
        lg: "16px",
      },
    },
    layout: {
      maxWidth: "1200px",
      containerPadding: "1rem",
      sectionSpacing: "4rem",
      gridGap: "2rem",
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    components: {
      button: {
        base: "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variants: {
          default: {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4",
            lg: "h-12 px-6 text-lg",
          },
        },
      },
      card: {
        base: "rounded-lg border bg-card text-card-foreground shadow-sm",
        variants: {
          default: {
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
          },
        },
      },
      input: {
        base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
        variants: {
          default: {
            sm: "h-8 px-2 text-sm",
            md: "h-10 px-3",
            lg: "h-12 px-4 text-lg",
          },
        },
      },
      badge: {
        base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants: {
          default: {
            sm: "px-2 py-0.5 text-xs",
            md: "px-2.5 py-0.5 text-xs",
            lg: "px-3 py-1 text-sm",
          },
        },
      },
    },
    tags: ["minimal", "professional", "blue", "clean"],
    popularity: 95,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSectionConfigs: SectionConfig[] = [
  {
    id: "hero",
    type: "hero",
    name: "Hero Section",
    description:
      "Main introduction section with name, title, and call-to-action",
    icon: "user",
    category: "header",
    fields: [
      {
        id: "name",
        name: "name",
        type: "text",
        label: "Full Name",
        required: true,
        validation: [{ type: "required", message: "Name is required" }],
      },
      {
        id: "title",
        name: "title",
        type: "text",
        label: "Professional Title",
        required: true,
        validation: [{ type: "required", message: "Title is required" }],
      },
      {
        id: "description",
        name: "description",
        type: "textarea",
        label: "Description",
        required: false,
      },
      {
        id: "profileImage",
        name: "profileImage",
        type: "image",
        label: "Profile Image",
        required: false,
      },
    ],
    layout: {
      type: "single-column",
      alignment: "center",
      spacing: "normal",
      background: {
        type: "solid",
        value: "#ffffff",
      },
    },
    styleOptions: {
      padding: ["sm", "md", "lg", "xl"],
      margin: ["none", "sm", "md", "lg"],
      backgroundColor: [],
      textColor: [],
      borderRadius: ["none", "sm", "md", "lg"],
      shadow: ["none", "sm", "md", "lg"],
      animation: ["none", "fade-in", "slide-up", "scale-in"],
    },
    constraints: {
      allowedPositions: [0, 1],
      minHeight: "400px",
    },
    isRequired: true,
    isCustomizable: true,
    order: 0,
  },
];

// Reducer for managing customization history
interface HistoryState {
  past: ThemeConfig[];
  present: ThemeConfig;
  future: ThemeConfig[];
}

type HistoryAction =
  | { type: "SET_THEME"; theme: ThemeConfig }
  | { type: "UPDATE_THEME"; updates: Partial<ThemeConfig> }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_HISTORY" };

const historyReducer = (
  state: HistoryState,
  action: HistoryAction
): HistoryState => {
  switch (action.type) {
    case "SET_THEME":
      return {
        past: [],
        present: action.theme,
        future: [],
      };

    case "UPDATE_THEME":
      return {
        past: [...state.past, state.present],
        present: { ...state.present, ...action.updates },
        future: [],
      };

    case "UNDO":
      if (state.past.length === 0) return state;

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };

    case "REDO":
      if (state.future.length === 0) return state;

      const next = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };

    case "CLEAR_HISTORY":
      return {
        past: [],
        present: state.present,
        future: [],
      };

    default:
      return state;
  }
};

export const PortfolioBuilder = () => {
  const [activeTab, setActiveTab] = useState("theme");
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(
    mockThemes[0]
  );
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [customizationState, setCustomizationState] =
    useState<CustomizationState>({
      mode: "edit",
      device: "desktop",
      showGrid: false,
      showSpacing: false,
    });

  // Theme history management
  const [themeHistory, dispatchTheme] = useReducer(historyReducer, {
    past: [],
    present: selectedTheme,
    future: [],
  });

  const handleThemeSelect = useCallback((theme: ThemeConfig) => {
    setSelectedTheme(theme);
    dispatchTheme({ type: "SET_THEME", theme });
  }, []);

  const handleThemeChange = useCallback((updates: Partial<ThemeConfig>) => {
    dispatchTheme({ type: "UPDATE_THEME", updates });
    setSelectedTheme((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCustomizationStateChange = useCallback(
    (updates: Partial<CustomizationState>) => {
      setCustomizationState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleSave = useCallback(() => {
    // Implementation for saving portfolio
    console.log("Saving portfolio...", {
      theme: themeHistory.present,
      sections,
      customizationState,
    });
  }, [themeHistory.present, sections, customizationState]);

  const handleReset = useCallback(() => {
    dispatchTheme({ type: "CLEAR_HISTORY" });
    setSelectedTheme(mockThemes[0]);
  }, []);

  const handleUndo = useCallback(() => {
    dispatchTheme({ type: "UNDO" });
    setSelectedTheme(
      themeHistory.past[themeHistory.past.length - 1] || selectedTheme
    );
  }, [themeHistory.past, selectedTheme]);

  const handleRedo = useCallback(() => {
    dispatchTheme({ type: "REDO" });
    setSelectedTheme(themeHistory.future[0] || selectedTheme);
  }, [themeHistory.future, selectedTheme]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Portfolio Builder</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={themeHistory.past.length === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={themeHistory.future.length === 0}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Builder tabs */}
        <div className="w-96 border-r border-border bg-muted/30">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Sections
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4 pt-0">
              <TabsContent value="theme" className="mt-4">
                <ThemeSelector
                  themes={mockThemes}
                  selectedTheme={selectedTheme}
                  onThemeSelect={handleThemeSelect}
                  onCustomizeTheme={(theme) => {
                    handleThemeSelect(theme);
                    setActiveTab("sections");
                  }}
                  onPreviewTheme={(theme) => {
                    handleThemeSelect(theme);
                    setCustomizationState((prev) => ({
                      ...prev,
                      mode: "preview",
                    }));
                  }}
                />
              </TabsContent>

              <TabsContent value="sections" className="mt-4">
                <SectionBuilder
                  sections={sections}
                  availableSections={mockSectionConfigs}
                  onSectionsChange={setSections}
                  onSectionEdit={(section) => {
                    setCustomizationState((prev) => ({
                      ...prev,
                      selectedSection: section.id,
                      mode: "edit",
                    }));
                  }}
                  onSectionPreview={(section) => {
                    setCustomizationState((prev) => ({
                      ...prev,
                      selectedSection: section.id,
                      mode: "preview",
                    }));
                  }}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Portfolio Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Global portfolio settings will be implemented here.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Center - Preview area */}
        <div className="flex-1 bg-muted/10">
          <PortfolioPreview
            theme={themeHistory.present}
            sections={sections}
            sectionConfigs={mockSectionConfigs}
            customizationState={customizationState}
          />
        </div>

        {/* Right sidebar - Customization panel */}
        <CustomizationPanel
          theme={themeHistory.present}
          customizationState={customizationState}
          onThemeChange={handleThemeChange}
          onStateChange={handleCustomizationStateChange}
          onSave={handleSave}
          onReset={handleReset}
          canUndo={themeHistory.past.length > 0}
          canRedo={themeHistory.future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>
    </div>
  );
};
