"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Pipette, 
  Copy, 
  RotateCcw,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { ColorPalette } from '@/types/theme-system';

interface ColorPickerProps {
  colors: ColorPalette;
  onChange: (colors: ColorPalette) => void;
}

const colorPresets = [
  {
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#8b5cf6'
    }
  },
  {
    name: 'Forest Green',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#f59e0b'
    }
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#ec4899'
    }
  },
  {
    name: 'Royal Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#06b6d4'
    }
  }
];

export const ColorPicker = ({ colors, onChange }: ColorPickerProps) => {
  const [activeColor, setActiveColor] = useState<string>('primary');

  const updateColor = (colorKey: string, value: string) => {
    if (colorKey.includes('.')) {
      const [parent, child] = colorKey.split('.');
      onChange({
        ...colors,
        [parent]: {
          ...colors[parent as keyof ColorPalette],
          [child]: value
        }
      });
    } else {
      onChange({
        ...colors,
        [colorKey]: value
      });
    }
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    onChange({
      ...colors,
      ...preset.colors
    });
  };

  const generateColorVariations = (baseColor: string) => {
    // This would typically use a color manipulation library
    // For now, we'll return a simple implementation
    const variations = {
      50: baseColor + '0D',
      100: baseColor + '1A',
      200: baseColor + '33',
      300: baseColor + '4D',
      400: baseColor + '66',
      500: baseColor,
      600: baseColor + 'CC',
      700: baseColor + 'B3',
      800: baseColor + '99',
      900: baseColor + '80'
    };
    
    return variations;
  };

  const ColorInput = ({ 
    label, 
    value, 
    colorKey, 
    description 
  }: { 
    label: string; 
    value: string; 
    colorKey: string; 
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigator.clipboard.writeText(value)}
          className="h-6 px-2"
        >
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: value }}
          onClick={() => setActiveColor(colorKey)}
        />
        <div className="flex-1 space-y-1">
          <Input
            type="color"
            value={value}
            onChange={(e) => updateColor(colorKey, e.target.value)}
            className="h-8 w-full"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => updateColor(colorKey, e.target.value)}
            className="h-8 text-xs font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyPreset(preset)}
                className="h-auto p-3 flex flex-col items-start gap-2"
              >
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
                <span className="text-xs font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Brand Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ColorInput
            label="Primary"
            value={colors.primary}
            colorKey="primary"
            description="Main brand color used for buttons, links, and highlights"
          />
          
          <ColorInput
            label="Secondary"
            value={colors.secondary}
            colorKey="secondary"
            description="Supporting color for accents and secondary elements"
          />
          
          <ColorInput
            label="Accent"
            value={colors.accent}
            colorKey="accent"
            description="Accent color for special highlights and call-to-actions"
          />
        </CardContent>
      </Card>

      {/* Background Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Background & Surface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ColorInput
            label="Background"
            value={colors.background}
            colorKey="background"
            description="Main page background color"
          />
          
          <ColorInput
            label="Surface"
            value={colors.surface}
            colorKey="surface"
            description="Card and component background color"
          />
          
          <ColorInput
            label="Border"
            value={colors.border}
            colorKey="border"
            description="Border color for components and dividers"
          />
        </CardContent>
      </Card>

      {/* Text Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Text Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ColorInput
            label="Primary Text"
            value={colors.text.primary}
            colorKey="text.primary"
            description="Main text color for headings and important content"
          />
          
          <ColorInput
            label="Secondary Text"
            value={colors.text.secondary}
            colorKey="text.secondary"
            description="Secondary text color for body content"
          />
          
          <ColorInput
            label="Muted Text"
            value={colors.text.muted}
            colorKey="text.muted"
            description="Muted text color for captions and less important content"
          />
        </CardContent>
      </Card>

      {/* Status Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ColorInput
            label="Success"
            value={colors.success}
            colorKey="success"
            description="Color for success states and positive feedback"
          />
          
          <ColorInput
            label="Warning"
            value={colors.warning}
            colorKey="warning"
            description="Color for warning states and caution messages"
          />
          
          <ColorInput
            label="Error"
            value={colors.error}
            colorKey="error"
            description="Color for error states and destructive actions"
          />
        </CardContent>
      </Card>

      {/* Color Harmony Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Pipette className="w-4 h-4 mr-2" />
            Extract from Image
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <RotateCcw className="w-4 h-4 mr-2" />
            Generate Palette
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 justify-start">
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </Button>
            <Button variant="outline" className="flex-1 justify-start">
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};