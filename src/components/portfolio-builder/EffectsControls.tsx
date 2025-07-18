"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Square, Circle, Zap, Layers, Bluetooth as Blur, Clock } from 'lucide-react';
import { EffectsConfig } from '@/types/theme-system';

interface EffectsControlsProps {
  effects: EffectsConfig;
  onChange: (effects: EffectsConfig) => void;
}

const shadowPresets = [
  { name: 'None', value: 'none' },
  { name: 'Subtle', value: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  { name: 'Soft', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  { name: 'Medium', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
  { name: 'Strong', value: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
  { name: 'Dramatic', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }
];

const borderRadiusPresets = [
  { name: 'None', value: '0' },
  { name: 'Small', value: '0.25rem' },
  { name: 'Medium', value: '0.5rem' },
  { name: 'Large', value: '0.75rem' },
  { name: 'Extra Large', value: '1rem' },
  { name: 'Full', value: '9999px' }
];

const animationPresets = [
  { name: 'Fast', duration: '150ms', easing: 'ease-out' },
  { name: 'Normal', duration: '300ms', easing: 'ease-in-out' },
  { name: 'Slow', duration: '500ms', easing: 'ease-in' },
  { name: 'Smooth', duration: '400ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
];

export const EffectsControls = ({ effects, onChange }: EffectsControlsProps) => {
  const updateShadow = (size: keyof EffectsConfig['shadows'], value: string) => {
    onChange({
      ...effects,
      shadows: {
        ...effects.shadows,
        [size]: value
      }
    });
  };

  const updateBorderRadius = (size: keyof EffectsConfig['borderRadius'], value: string) => {
    onChange({
      ...effects,
      borderRadius: {
        ...effects.borderRadius,
        [size]: value
      }
    });
  };

  const updateAnimation = (property: 'duration' | 'easing', type: string, value: string) => {
    onChange({
      ...effects,
      animations: {
        ...effects.animations,
        [property]: {
          ...effects.animations[property],
          [type]: value
        }
      }
    });
  };

  const updateBlur = (size: keyof EffectsConfig['blur'], value: string) => {
    onChange({
      ...effects,
      blur: {
        ...effects.blur,
        [size]: value
      }
    });
  };

  const applyShadowPreset = (preset: typeof shadowPresets[0]) => {
    onChange({
      ...effects,
      shadows: {
        sm: preset.value === 'none' ? 'none' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: preset.value,
        lg: preset.value === 'none' ? 'none' : '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: preset.value === 'none' ? 'none' : '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    });
  };

  const applyBorderRadiusPreset = (preset: typeof borderRadiusPresets[0]) => {
    const scale = preset.value === '0' ? 0 : preset.value === '9999px' ? 999 : parseFloat(preset.value);
    
    onChange({
      ...effects,
      borderRadius: {
        sm: preset.value === '0' ? '0' : preset.value === '9999px' ? '9999px' : `${scale * 0.5}rem`,
        md: preset.value,
        lg: preset.value === '0' ? '0' : preset.value === '9999px' ? '9999px' : `${scale * 1.5}rem`,
        xl: preset.value === '0' ? '0' : preset.value === '9999px' ? '9999px' : `${scale * 2}rem`,
        full: '9999px'
      }
    });
  };

  const applyAnimationPreset = (preset: typeof animationPresets[0]) => {
    onChange({
      ...effects,
      animations: {
        duration: {
          fast: '150ms',
          normal: preset.duration,
          slow: '500ms'
        },
        easing: {
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: preset.easing
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Shadow Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Shadow Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {shadowPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyShadowPreset(preset)}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <div 
                  className="w-8 h-8 bg-white border rounded"
                  style={{ boxShadow: preset.value }}
                />
                <span className="text-xs font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Shadows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Shadow Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(effects.shadows).map(([size, value]) => (
            <div key={size}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium uppercase">{size}</Label>
                <div 
                  className="w-6 h-6 bg-white border rounded"
                  style={{ boxShadow: value }}
                />
              </div>
              <Input
                value={value}
                onChange={(e) => updateShadow(size as any, e.target.value)}
                placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                className="text-xs font-mono"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Border Radius Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Square className="w-4 h-4" />
            Border Radius Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {borderRadiusPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyBorderRadiusPreset(preset)}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                <div 
                  className="w-8 h-8 bg-primary/20 border border-primary/30"
                  style={{ borderRadius: preset.value }}
                />
                <span className="text-xs font-medium">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Border Radius Values</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(effects.borderRadius).map(([size, value]) => (
            <div key={size}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium uppercase">{size}</Label>
                <div 
                  className="w-6 h-6 bg-primary/20 border border-primary/30"
                  style={{ borderRadius: value }}
                />
              </div>
              <Input
                value={value}
                onChange={(e) => updateBorderRadius(size as any, e.target.value)}
                placeholder="0.5rem"
                className="text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Animation Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Animation Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {animationPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyAnimationPreset(preset)}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.duration}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Animation Durations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Animation Durations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(effects.animations.duration).map(([speed, value]) => (
            <div key={speed}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium capitalize">{speed}</Label>
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              </div>
              <Input
                value={value}
                onChange={(e) => updateAnimation('duration', speed, e.target.value)}
                placeholder="300ms"
                className="text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Animation Easing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Animation Easing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(effects.animations.easing).map(([easing, value]) => (
            <div key={easing}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">{easing}</Label>
                <Badge variant="outline" className="text-xs">
                  {value}
                </Badge>
              </div>
              <Input
                value={value}
                onChange={(e) => updateAnimation('easing', easing, e.target.value)}
                placeholder="ease-in-out"
                className="text-xs font-mono"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Blur Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Blur className="w-4 h-4" />
            Blur Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(effects.blur).map(([size, value]) => (
            <div key={size}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium uppercase">{size}</Label>
                <div className="relative">
                  <div className="w-6 h-6 bg-primary/50 rounded" />
                  <div 
                    className="absolute inset-0 w-6 h-6 bg-primary/50 rounded"
                    style={{ filter: `blur(${value})` }}
                  />
                </div>
              </div>
              <Input
                value={value}
                onChange={(e) => updateBlur(size as any, e.target.value)}
                placeholder="4px"
                className="text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Effects Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Effects Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Shadow (MD)</Label>
              <div 
                className="w-full h-16 bg-white border rounded flex items-center justify-center text-xs"
                style={{ boxShadow: effects.shadows.md }}
              >
                Shadow
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Border Radius (MD)</Label>
              <div 
                className="w-full h-16 bg-primary/20 border border-primary/30 flex items-center justify-center text-xs"
                style={{ borderRadius: effects.borderRadius.md }}
              >
                Rounded
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Blur (MD)</Label>
              <div className="relative w-full h-16 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center text-xs text-white">
                <div 
                  className="absolute inset-0 bg-black/20 rounded"
                  style={{ filter: `blur(${effects.blur.md})` }}
                />
                <span className="relative z-10">Blur</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Animation</Label>
              <div 
                className="w-full h-16 bg-accent/20 border border-accent/30 rounded flex items-center justify-center text-xs hover:scale-105 cursor-pointer"
                style={{ 
                  transition: `transform ${effects.animations.duration.normal} ${effects.animations.easing.easeInOut}` 
                }}
              >
                Hover me
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};