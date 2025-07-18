"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Code,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { ThemeConfig, CustomizationState } from '@/types/theme-system';
import { ColorPicker } from './ColorPicker';
import { TypographyControls } from './TypographyControls';
import { SpacingControls } from './SpacingControls';
import { EffectsControls } from './EffectsControls';

interface CustomizationPanelProps {
  theme: ThemeConfig;
  customizationState: CustomizationState;
  onThemeChange: (theme: Partial<ThemeConfig>) => void;
  onStateChange: (state: Partial<CustomizationState>) => void;
  onSave: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const CustomizationPanel = ({
  theme,
  customizationState,
  onThemeChange,
  onStateChange,
  onSave,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}: CustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState('colors');

  const deviceOptions = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  const modeOptions = [
    { id: 'edit', icon: Code, label: 'Edit' },
    { id: 'preview', icon: Eye, label: 'Preview' }
  ];

  return (
    <div className="w-80 bg-background border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Customize</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Device and mode toggles */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
              DEVICE
            </Label>
            <div className="flex rounded-lg border p-1">
              {deviceOptions.map((device) => {
                const Icon = device.icon;
                return (
                  <Button
                    key={device.id}
                    variant={customizationState.device === device.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onStateChange({ device: device.id as any })}
                    className="flex-1 h-8"
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
              MODE
            </Label>
            <div className="flex rounded-lg border p-1">
              {modeOptions.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant={customizationState.mode === mode.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onStateChange({ mode: mode.id as any })}
                    className="flex-1 h-8"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {mode.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Helper toggles */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Grid</Label>
            <Switch
              checked={customizationState.showGrid}
              onCheckedChange={(checked) => onStateChange({ showGrid: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Spacing</Label>
            <Switch
              checked={customizationState.showSpacing}
              onCheckedChange={(checked) => onStateChange({ showSpacing: checked })}
            />
          </div>
        </div>
      </div>

      {/* Customization tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="colors" className="flex flex-col gap-1 h-12">
              <Palette className="w-4 h-4" />
              <span className="text-xs">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex flex-col gap-1 h-12">
              <Type className="w-4 h-4" />
              <span className="text-xs">Type</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex flex-col gap-1 h-12">
              <Layout className="w-4 h-4" />
              <span className="text-xs">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex flex-col gap-1 h-12">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Effects</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 pt-0">
            <TabsContent value="colors" className="mt-4 space-y-4">
              <ColorPicker
                colors={theme.colors}
                onChange={(colors) => onThemeChange({ colors })}
              />
            </TabsContent>

            <TabsContent value="typography" className="mt-4 space-y-4">
              <TypographyControls
                typography={theme.typography}
                onChange={(typography) => onThemeChange({ typography })}
              />
            </TabsContent>

            <TabsContent value="layout" className="mt-4 space-y-4">
              <SpacingControls
                spacing={theme.spacing}
                layout={theme.layout}
                onChange={(updates) => onThemeChange(updates)}
              />
            </TabsContent>

            <TabsContent value="effects" className="mt-4 space-y-4">
              <EffectsControls
                effects={theme.effects}
                onChange={(effects) => onThemeChange({ effects })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={onSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onReset} className="w-full">
          Reset to Default
        </Button>
      </div>
    </div>
  );
};