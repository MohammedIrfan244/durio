"use client";

import React, { useState } from 'react';
import { useSettings } from '@/components/providers/settings-provider';
import { APP_REGISTRY } from '@/config/modules';
import { updateUserSettings } from '@/server/actions/settings-actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, ShieldOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  const { fancyMode, disabledModules, setFancyMode, setDisabledModules, isLoading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFancyModeToggle = async (checked: boolean) => {
    setIsSaving(true);
    // Optimistic update
    const previous = fancyMode;
    setFancyMode(checked);
    
    const res = await updateUserSettings({ fancyMode: checked });
    if (!res.success) {
      toast.error("Failed to update Fancy Mode");
      setFancyMode(previous);
    } else {
      toast.success(checked ? "Fancy Mode Enabled ✨" : "Fancy Mode Disabled 🚀");
    }
    setIsSaving(false);
  };

  const handleModuleToggle = async (moduleKey: string, isEnabling: boolean) => {
    setIsSaving(true);
    // Optimistic update
    const previousDisabled = [...disabledModules];
    
    let newDisabled = [...disabledModules];
    if (isEnabling) {
        newDisabled = newDisabled.filter(m => m !== moduleKey);
    } else {
        if (!newDisabled.includes(moduleKey)) newDisabled.push(moduleKey);
    }
    
    setDisabledModules(newDisabled);

    const res = await updateUserSettings({ disabledModules: newDisabled });
    if (!res.success) {
      toast.error("Failed to update module visibility");
      setDisabledModules(previousDisabled);
    } else {
      toast.success("Navigation updated");
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and toggle active modules.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Performance & UI
          </CardTitle>
          <CardDescription>
            Control the visual intensity of the application to save battery and boost performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/20">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Fancy Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enables heavy animations, background themes, and sidebar decorations. Turn off for maximum performance.
              </p>
            </div>
            <Switch 
              checked={fancyMode} 
              onCheckedChange={handleFancyModeToggle} 
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="w-5 h-5 text-blue-500" />
            Active Modules
          </CardTitle>
          <CardDescription>
            Toggle which features appear in your Sidebar. Disabling a module will hide it from navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(APP_REGISTRY.MODULES).map(([key, module]) => {
              if (key === "HOME") return null; // Prevent disabling Home

              const isSystemDisabled = module.systemDisabled;
              const isUserEnabled = !disabledModules.includes(key);
              
              // It's checked if it's NOT in disabledModules AND it's NOT systemDisabled
              const isChecked = isUserEnabled && !isSystemDisabled;

              return (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-4 rounded-lg border border-border/50 ${isSystemDisabled ? 'bg-secondary/10 opacity-70' : 'bg-secondary/20'}`}
                >
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold capitalize">
                      {(module as any).label || key.toLowerCase()}
                    </Label>
                    {isSystemDisabled && (
                      <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        Currently in development
                      </p>
                    )}
                  </div>
                  <Switch 
                    checked={isChecked} 
                    disabled={isSystemDisabled || isSaving}
                    onCheckedChange={(checked) => handleModuleToggle(key, checked)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}