"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Maximize, 
  Move, 
  Square, 
  Grid3X3,
  Ruler,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { SpacingConfig, LayoutConfig } from '@/types/theme-system';

interface SpacingControlsProps {
  spacing: SpacingConfig;
  layout: LayoutConfig;
  onChange: (updates: { spacing?: SpacingConfig; layout?: LayoutConfig }) => void;
}

const spacingPresets = [
  { name: 'Compact', scale: 0.75 },
  { name: 'Normal', scale: 1 },
  { name: 'Comfortable', scale: 1.25 },
  { name: 'Spacious', scale: 1.5 }
];

export const SpacingControls = ({ spacing, layout, onChange }: SpacingControlsProps) => {
  const updateSpacingScale = (scale: number) => {
    const baseValues = {
      sections: {
        xs: 2,
        sm: 3,
        md: 4,
        lg: 6,
        xl: 8
      },
      components: {
        xs: 0.5,
        sm: 1,
        md: 1.5,
        lg: 2,
        xl: 3
      }
    };

    const scaledSpacing = {
      scale,
      sections: Object.entries(baseValues.sections).reduce((acc, [key, value]) => {
        acc[key] = `${value * scale}rem`;
        return acc;
      }, {} as Record<string, string>),
      components: Object.entries(baseValues.components).reduce((acc, [key, value]) => {
        acc[key] = `${value * scale}rem`;
        return acc;
      }, {} as Record<string, string>)
    };

    onChange({ spacing: scaledSpacing as SpacingConfig });
  };

  const updateLayoutProperty = (property: keyof LayoutConfig, value: string) => {
    onChange({
      layout: {
        ...layout,
        [property]: value
      }
    });
  };

  const updateBreakpoint = (breakpoint: keyof LayoutConfig['breakpoints'], value: string) => {
    onChange({
      layout: {
        ...layout,
        breakpoints: {
          ...layout.breakpoints,
          [breakpoint]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Spacing Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Spacing Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {spacingPresets.map((preset) => (
              <Button
                key={preset.name}
                variant={spacing.scale === preset.scale ? 'default' : 'outline'}
                onClick={() => updateSpacingScale(preset.scale)}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <span className="font-medium text-sm">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.scale}x
                </span>
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Custom Scale</Label>
            <Slider
              value={[spacing.scale]}
              onValueChange={([value]) => updateSpacingScale(value)}
              min={0.5}
              max={2}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>Current: {spacing.scale}x</span>
              <span>2x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Section Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(spacing.sections).map(([size, value]) => (
            <div key={size}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium uppercase">{size}</Label>
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  value={value}
                  onChange={(e) => onChange({
                    spacing: {
                      ...spacing,
                      sections: {
                        ...spacing.sections,
                        [size]: e.target.value
                      }
                    }
                  })}
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSpacingScale(spacing.scale)}
                  className="px-2"
                >
                  Reset
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Component Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Component Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(spacing.components).map(([size, value]) => (
            <div key={size}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium uppercase">{size}</Label>
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  value={value}
                  onChange={(e) => onChange({
                    spacing: {
                      ...spacing,
                      components: {
                        ...spacing.components,
                        [size]: e.target.value
                      }
                    }
                  })}
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSpacingScale(spacing.scale)}
                  className="px-2"
                >
                  Reset
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Maximize className="w-4 h-4" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Max Width</Label>
            <Input
              value={layout.maxWidth}
              onChange={(e) => updateLayoutProperty('maxWidth', e.target.value)}
              placeholder="1200px"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Container Padding</Label>
            <Input
              value={layout.containerPadding}
              onChange={(e) => updateLayoutProperty('containerPadding', e.target.value)}
              placeholder="1rem"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Section Spacing</Label>
            <Input
              value={layout.sectionSpacing}
              onChange={(e) => updateLayoutProperty('sectionSpacing', e.target.value)}
              placeholder="4rem"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Grid Gap</Label>
            <Input
              value={layout.gridGap}
              onChange={(e) => updateLayoutProperty('gridGap', e.target.value)}
              placeholder="2rem"
            />
          </div>
        </CardContent>
      </Card>

      {/* Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Responsive Breakpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(layout.breakpoints).map(([breakpoint, value]) => {
            const icons = {
              sm: Smartphone,
              md: Tablet,
              lg: Monitor,
              xl: Monitor,
              '2xl': Monitor
            };
            const Icon = icons[breakpoint as keyof typeof icons] || Monitor;

            return (
              <div key={breakpoint}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium uppercase">{breakpoint}</Label>
                  <Badge variant="outline" className="text-xs">
                    {value}
                  </Badge>
                </div>
                <Input
                  value={value}
                  onChange={(e) => updateBreakpoint(breakpoint as any, e.target.value)}
                  placeholder="768px"
                  className="text-xs"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Spacing Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Spacing Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Section Spacing (MD)
              </Label>
              <div 
                className="bg-primary/10 rounded border-2 border-dashed border-primary/30 flex items-center justify-center text-xs text-primary"
                style={{ height: spacing.sections.md }}
              >
                {spacing.sections.md}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Component Spacing (MD)
              </Label>
              <div 
                className="bg-secondary/10 rounded border-2 border-dashed border-secondary/30 flex items-center justify-center text-xs text-secondary"
                style={{ height: spacing.components.md }}
              >
                {spacing.components.md}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};