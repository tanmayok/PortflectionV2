"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { TypographyConfig } from '@/types/theme-system';

interface TypographyControlsProps {
  typography: TypographyConfig;
  onChange: (typography: TypographyConfig) => void;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter', category: 'Sans Serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans Serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans Serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans Serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans Serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' }
];

const fontSizePresets = [
  { name: 'Small', scale: 0.875 },
  { name: 'Medium', scale: 1 },
  { name: 'Large', scale: 1.125 },
  { name: 'Extra Large', scale: 1.25 }
];

export const TypographyControls = ({ typography, onChange }: TypographyControlsProps) => {
  const updateFontFamily = (type: keyof TypographyConfig['fontFamilies'], value: string) => {
    onChange({
      ...typography,
      fontFamilies: {
        ...typography.fontFamilies,
        [type]: value
      }
    });
  };

  const updateFontWeight = (type: keyof TypographyConfig['fontWeights'], value: number) => {
    onChange({
      ...typography,
      fontWeights: {
        ...typography.fontWeights,
        [type]: value
      }
    });
  };

  const updateLineHeight = (type: keyof TypographyConfig['lineHeights'], value: number) => {
    onChange({
      ...typography,
      lineHeights: {
        ...typography.lineHeights,
        [type]: value
      }
    });
  };

  const updateLetterSpacing = (type: keyof TypographyConfig['letterSpacing'], value: string) => {
    onChange({
      ...typography,
      letterSpacing: {
        ...typography.letterSpacing,
        [type]: value
      }
    });
  };

  const applyFontSizePreset = (scale: number) => {
    const baseSizes = {
      xs: 0.75,
      sm: 0.875,
      base: 1,
      lg: 1.125,
      xl: 1.25,
      '2xl': 1.5,
      '3xl': 1.875,
      '4xl': 2.25,
      '5xl': 3,
      '6xl': 3.75
    };

    const scaledSizes = Object.entries(baseSizes).reduce((acc, [key, size]) => {
      acc[key] = `${size * scale}rem`;
      return acc;
    }, {} as Record<string, string>);

    onChange({
      ...typography,
      fontSizes: scaledSizes as TypographyConfig['fontSizes']
    });
  };

  return (
    <div className="space-y-6">
      {/* Font Size Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Size Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {fontSizePresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyFontSizePreset(preset.scale)}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <span className="font-medium text-sm">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.scale}x
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Families */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Font Families</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Heading Font</Label>
            <Select
              value={typography.fontFamilies.heading}
              onValueChange={(value) => updateFontFamily('heading', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center justify-between w-full">
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {font.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Body Font</Label>
            <Select
              value={typography.fontFamilies.body}
              onValueChange={(value) => updateFontFamily('body', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center justify-between w-full">
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {font.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Monospace Font</Label>
            <Select
              value={typography.fontFamilies.mono}
              onValueChange={(value) => updateFontFamily('mono', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.filter(f => f.category === 'Monospace').map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Font Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(typography.fontWeights).map(([weight, value]) => (
            <div key={weight}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium capitalize">{weight}</Label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([newValue]) => updateFontWeight(weight as any, newValue)}
                min={100}
                max={900}
                step={100}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Line Heights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Heights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(typography.lineHeights).map(([height, value]) => (
            <div key={height}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium capitalize">{height}</Label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([newValue]) => updateLineHeight(height as any, newValue)}
                min={1}
                max={2.5}
                step={0.05}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Letter Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Letter Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(typography.letterSpacing).map(([spacing, value]) => (
            <div key={spacing}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium capitalize">{spacing}</Label>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Slider
                value={[parseFloat(value.replace('em', '')) * 1000]}
                onValueChange={([newValue]) => 
                  updateLetterSpacing(spacing as any, `${newValue / 1000}em`)
                }
                min={-50}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: typography.fontFamilies.heading,
                  fontWeight: typography.fontWeights.bold,
                  lineHeight: typography.lineHeights.tight,
                  letterSpacing: typography.letterSpacing.tight
                }}
              >
                Heading Example
              </h1>
            </div>
            
            <div>
              <p 
                style={{ 
                  fontFamily: typography.fontFamilies.body,
                  fontWeight: typography.fontWeights.normal,
                  lineHeight: typography.lineHeights.normal,
                  letterSpacing: typography.letterSpacing.normal,
                  fontSize: typography.fontSizes.base
                }}
              >
                This is a sample paragraph to demonstrate how the body text will look with your current typography settings. You can see how the font family, weight, line height, and letter spacing work together.
              </p>
            </div>
            
            <div>
              <code 
                className="text-sm bg-muted p-2 rounded block"
                style={{ 
                  fontFamily: typography.fontFamilies.mono,
                  fontSize: typography.fontSizes.sm
                }}
              >
                const example = "monospace font";
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};