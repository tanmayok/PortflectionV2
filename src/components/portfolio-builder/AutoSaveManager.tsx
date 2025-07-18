"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Save, CheckCircle, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoSaveState, Portfolio } from '@/types/component-system';

interface AutoSaveManagerProps {
  portfolio: Portfolio;
  onSave: (portfolio: Portfolio) => Promise<void>;
  autoSaveInterval?: number; // milliseconds
  children: (autoSaveState: AutoSaveState, triggerSave: () => void) => React.ReactNode;
}

export const AutoSaveManager = ({
  portfolio,
  onSave,
  autoSaveInterval = 3000, // 3 seconds
  children
}: AutoSaveManagerProps) => {
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isEnabled: true,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false,
    saveInterval: autoSaveInterval,
    error: null
  });

  const [isOnline, setIsOnline] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastPortfolioRef = useRef<Portfolio>(portfolio);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save function with retry logic
  const savePortfolio = useCallback(async (portfolioToSave: Portfolio, isManual = false) => {
    if (!isOnline && !isManual) {
      setAutoSaveState(prev => ({
        ...prev,
        error: 'No internet connection'
      }));
      return;
    }

    setAutoSaveState(prev => ({
      ...prev,
      isSaving: true,
      error: null
    }));

    try {
      await onSave(portfolioToSave);
      
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null
      }));

      retryCountRef.current = 0;
      
      if (isManual) {
        toast.success('Portfolio saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      
      retryCountRef.current++;
      
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed'
      }));

      if (isManual) {
        toast.error('Failed to save portfolio');
      } else if (retryCountRef.current < maxRetries) {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000;
        setTimeout(() => savePortfolio(portfolioToSave), retryDelay);
      } else {
        toast.error('Auto-save failed. Please save manually.');
      }
    }
  }, [onSave, isOnline]);

  // Manual save trigger
  const triggerManualSave = useCallback(() => {
    savePortfolio(portfolio, true);
  }, [portfolio, savePortfolio]);

  // Auto-save logic
  useEffect(() => {
    // Check if portfolio has changed
    const hasChanged = JSON.stringify(portfolio) !== JSON.stringify(lastPortfolioRef.current);
    
    if (hasChanged) {
      lastPortfolioRef.current = portfolio;
      
      setAutoSaveState(prev => ({
        ...prev,
        hasUnsavedChanges: true
      }));

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new auto-save timeout
      if (autoSaveState.isEnabled && isOnline) {
        saveTimeoutRef.current = setTimeout(() => {
          savePortfolio(portfolio);
        }, autoSaveInterval);
      }
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [portfolio, autoSaveState.isEnabled, autoSaveInterval, savePortfolio, isOnline]);

  // Save status indicator
  const SaveStatusIndicator = () => {
    const getStatusInfo = () => {
      if (!isOnline) {
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          variant: 'destructive' as const,
          description: 'Changes will be saved when connection is restored'
        };
      }

      if (autoSaveState.isSaving) {
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          variant: 'secondary' as const,
          description: 'Saving your changes'
        };
      }

      if (autoSaveState.error) {
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          variant: 'destructive' as const,
          description: autoSaveState.error
        };
      }

      if (autoSaveState.hasUnsavedChanges) {
        return {
          icon: <Save className="w-4 h-4" />,
          text: 'Unsaved changes',
          variant: 'secondary' as const,
          description: 'Changes will be saved automatically'
        };
      }

      if (autoSaveState.lastSaved) {
        const timeSince = Math.floor((Date.now() - autoSaveState.lastSaved.getTime()) / 1000);
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: timeSince < 60 ? 'Saved' : `Saved ${Math.floor(timeSince / 60)}m ago`,
          variant: 'default' as const,
          description: `Last saved at ${autoSaveState.lastSaved.toLocaleTimeString()}`
        };
      }

      return {
        icon: <Save className="w-4 h-4" />,
        text: 'Ready to save',
        variant: 'secondary' as const,
        description: 'Make changes to auto-save'
      };
    };

    const status = getStatusInfo();

    return (
      <div className="flex items-center gap-2">
        <Badge variant={status.variant} className="flex items-center gap-1">
          {status.icon}
          {status.text}
        </Badge>
        
        {!isOnline && (
          <Badge variant="outline" className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Save Status Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <SaveStatusIndicator />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualSave}
            disabled={autoSaveState.isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Now
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoSaveState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
          >
            Auto-save: {autoSaveState.isEnabled ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Render children with auto-save state */}
      {children(autoSaveState, triggerManualSave)}
    </div>
  );
};

// Hook for using auto-save in components
export const useAutoSave = (
  data: any,
  saveFunction: (data: any) => Promise<void>,
  options: {
    interval?: number;
    enabled?: boolean;
  } = {}
) => {
  const { interval = 3000, enabled = true } = options;
  const [saveState, setSaveState] = useState<AutoSaveState>({
    isEnabled: enabled,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false,
    saveInterval: interval,
    error: null
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef(data);

  const save = useCallback(async (isManual = false) => {
    setSaveState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await saveFunction(data);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null
      }));

      if (isManual) {
        toast.success('Saved successfully!');
      }
    } catch (error) {
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed'
      }));

      if (isManual) {
        toast.error('Save failed');
      }
    }
  }, [data, saveFunction]);

  useEffect(() => {
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (hasChanged) {
      lastDataRef.current = data;
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (enabled) {
        saveTimeoutRef.current = setTimeout(() => save(), interval);
      }
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, interval, save]);

  return {
    saveState,
    triggerSave: () => save(true),
    toggleAutoSave: () => setSaveState(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
  };
};