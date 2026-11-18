"use client";

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/providers/settings-provider';
import { APP_REGISTRY } from '@/config/modules';
import { updateUserSettings } from '@/server/actions/settings-actions';
import { getActiveAppAlert } from '@/server/actions/app-alert-actions';
import { triggerAppAlertModal } from '@/components/shared/in-app-alert-modal';
import { downloadAppApk } from '@/lib/client/download-apk';
import type { AppAlert } from '@prisma/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, ShieldOff, Loader2, Trash2, Smartphone, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeaderWrapper } from '@/components/layout/section-header-wrapper';
import { AvatarSection } from './avatar-section';
import DeleteAccountDialog from './delete-account-dialog';

export default function Settings() {
  const { fancyMode, disabledModules, setFancyMode, setDisabledModules, isLoading } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appAlert, setAppAlert] = useState<AppAlert | null>(null);

  useEffect(() => {
    async function loadAlert() {
      const res = await getActiveAppAlert();
      if (res.success && res.data) {
        setAppAlert(res.data);
      }
    }
    loadAlert();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleDownloadApk = () => {
    downloadAppApk(appAlert?.downloadUrl);
  };

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
      toast.success(checked ? "Fancy Mode Enabled" : "Fancy Mode Disabled");
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
    <div className="section-wrapper">
      <SectionHeaderWrapper>
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
          <p className="text-muted-foreground">Manage your app preferences and toggle active modules.</p>
        </div>
      </SectionHeaderWrapper>

      <div className="w-full space-y-6 pb-20 mt-6">

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
              if (key === "HOME" || key === "SETTINGS") return null; // Prevent disabling Home and Settings

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
                      {"label" in module && typeof module.label === "string" ? module.label : key.toLowerCase()}
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

      {/* Avatar Section */}
      <AvatarSection />

      {/* App Version and Updates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            App Updates and Version
          </CardTitle>
          <CardDescription>
            Check for new releases, install APK updates, and view release notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/20 gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">Durio Mobile</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                  v{appAlert?.version || "1.1"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {appAlert?.title || "Latest stable release ready for download"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerAppAlertModal}
                className="gap-1.5 text-xs"
              >
                <ExternalLink size={14} />
                View Announcement
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadApk}
                className="gap-1.5 text-xs font-semibold"
              >
                <Download size={14} />
                Download APK
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-secondary/10 p-4 space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              What is included in this update
            </span>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {appAlert?.changelog && appAlert.changelog.length > 0 ? (
                appAlert.changelog.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>3-day cycle warning reminders for menstruation tracker</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Dedicated overdue task column with real-time due tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Reliable mobile push notification delivery via Firebase</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Manage your account deletion. You can temporarily deactivate or permanently delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            See our <a href="/privacy-policy" target="_self" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a> for details on account deletion options.
          </p>
        </CardContent>
      </Card>

      </div>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} />

    </div>
  );
}
