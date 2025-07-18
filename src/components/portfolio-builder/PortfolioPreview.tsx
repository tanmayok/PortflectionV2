"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Tablet,
  Smartphone,
  Grid3X3,
  Ruler,
  Eye,
  Code,
  LayoutDashboard,
} from "lucide-react";
import {
  ThemeConfig,
  PortfolioSection,
  SectionConfig,
  CustomizationState,
} from "@/types/theme-system";

interface PortfolioPreviewProps {
  theme: ThemeConfig;
  sections: PortfolioSection[];
  sectionConfigs: SectionConfig[];
  customizationState: CustomizationState;
}

export const PortfolioPreview = ({
  theme,
  sections,
  sectionConfigs,
  customizationState,
}: PortfolioPreviewProps) => {
  const deviceDimensions = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px" },
    mobile: { width: "375px", height: "812px" },
  };

  const currentDimensions = deviceDimensions[customizationState.device];

  const getSectionConfig = (sectionConfigId: string) => {
    return sectionConfigs.find((config) => config.id === sectionConfigId);
  };

  const renderSection = (section: PortfolioSection) => {
    const config = getSectionConfig(section.sectionConfigId);
    if (!config || !section.isVisible) return null;

    const isSelected = customizationState.selectedSection === section.id;

    return (
      <div
        key={section.id}
        className={`relative transition-all duration-200 ${
          isSelected ? "ring-2 ring-primary ring-offset-2" : ""
        } ${
          customizationState.mode === "edit"
            ? "hover:ring-1 hover:ring-muted-foreground/50"
            : ""
        }`}
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.sections.md,
          borderRadius: theme.effects.borderRadius.md,
          marginBottom: theme.spacing.sections.sm,
        }}
      >
        {/* Section overlay for edit mode */}
        {customizationState.mode === "edit" && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              {config.name}
            </Badge>
          </div>
        )}

        {/* Mock section content */}
        <div className="space-y-4">
          {config.type === "hero" && (
            <div className="text-center space-y-4">
              <div
                className="w-24 h-24 rounded-full mx-auto"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <h1
                className="text-4xl font-bold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamilies.heading,
                }}
              >
                {section.content.name || "Your Name"}
              </h1>
              <p
                className="text-xl"
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamilies.body,
                }}
              >
                {section.content.title || "Your Professional Title"}
              </p>
              <Button style={{ backgroundColor: theme.colors.primary }}>
                Get In Touch
              </Button>
            </div>
          )}

          {config.type === "about" && (
            <div className="space-y-4">
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamilies.heading,
                }}
              >
                About Me
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p
                    style={{
                      color: theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamilies.body,
                    }}
                  >
                    {section.content.description ||
                      "Your professional story and background..."}
                  </p>
                </div>
                <div className="space-y-2">
                  {["Skill 1", "Skill 2", "Skill 3"].map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <span style={{ color: theme.colors.text.secondary }}>
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.type === "projects" && (
            <div className="space-y-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamilies.heading,
                }}
              >
                Projects
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((project) => (
                  <Card
                    key={project}
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <CardContent className="p-4">
                      <div
                        className="w-full h-32 rounded mb-4"
                        style={{ backgroundColor: theme.colors.primary + "20" }}
                      />
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        Project {project}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Project description and details...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {config.type === "contact" && (
            <div className="text-center space-y-4">
              <h2
                className="text-2xl font-bold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamilies.heading,
                }}
              >
                Get In Touch
              </h2>
              <p
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamilies.body,
                }}
              >
                Ready to work together? Let's create something amazing.
              </p>
              <div className="flex justify-center gap-4">
                <Button style={{ backgroundColor: theme.colors.primary }}>
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  style={{ borderColor: theme.colors.border }}
                >
                  Download CV
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Grid overlay */}
        {customizationState.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${theme.colors.primary} 1px, transparent 1px),
                linear-gradient(to bottom, ${theme.colors.primary} 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Spacing overlay */}
        {customizationState.showSpacing && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 border-2 border-dashed"
              style={{ borderColor: theme.colors.accent }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Preview</h3>

            {/* Device selector */}
            <div className="flex rounded-lg border p-1">
              {[
                { id: "desktop", icon: Monitor },
                { id: "tablet", icon: Tablet },
                { id: "mobile", icon: Smartphone },
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant={
                    customizationState.device === id ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    customizationState.device !== id &&
                    // This would trigger the device change
                    console.log("Change device to:", id)
                  }
                  className="h-8 w-8 p-0"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={
                  customizationState.mode === "edit" ? "default" : "ghost"
                }
                size="sm"
                className="h-8"
              >
                <Code className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant={
                  customizationState.mode === "preview" ? "default" : "ghost"
                }
                size="sm"
                className="h-8"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>

            {/* Helper toggles */}
            <Button
              variant={customizationState.showGrid ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>

            <Button
              variant={customizationState.showSpacing ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Ruler className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-muted/20 p-8">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-xl transition-all duration-300 overflow-auto"
            style={{
              width: currentDimensions.width,
              height: currentDimensions.height,
              maxHeight:
                customizationState.device === "desktop"
                  ? "none"
                  : currentDimensions.height,
              borderRadius:
                customizationState.device !== "desktop" ? "12px" : "0",
            }}
          >
            <div
              className="min-h-full"
              style={{
                backgroundColor: theme.colors.background,
                fontFamily: theme.typography.fontFamilies.body,
                color: theme.colors.text.primary,
              }}
            >
              {sections.length > 0 ? (
                sections.sort((a, b) => a.order - b.order).map(renderSection)
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        No sections added
                      </h3>
                      <p className="text-muted-foreground">
                        Add sections from the builder to see your portfolio come
                        to life
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
