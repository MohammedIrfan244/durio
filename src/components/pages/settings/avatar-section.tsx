"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadAvatar, deleteAvatar } from '@/server/actions/upload-action';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AvatarSection() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = session?.user?.avatar || null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        handleFileSelect(droppedFile);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveAvatar = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setAvatarLoading(true);
    try {
      const avatarUrl = await uploadAvatar({ file });
      await update({ avatar: avatarUrl });
      toast.success("Avatar updated successfully!");
      setAvatarDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update avatar");
      console.error(error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      await deleteAvatar();
      await update({ avatar: null });
      toast.success("Avatar removed");
      setAvatarDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove avatar");
      console.error(error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const openAvatarDialog = () => {
    setPreview(currentAvatar);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAvatarDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-500" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Manage your profile picture. This will be shown in the header and account menu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 p-4 rounded-lg border border-border/50 bg-secondary/20">
            <div className="relative">
              {currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt="Current avatar"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-2 bottom-0 h-8 w-8 rounded-full bg-background shadow-lg"
                onClick={openAvatarDialog}
                aria-label="Change avatar"
              >
                <Camera size={16} />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {currentAvatar ? "Current avatar" : "No avatar set"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click the camera icon to change or upload a new profile picture.
              </p>
              {!currentAvatar && (
                <Button variant="outline" size="sm" onClick={openAvatarDialog} className="mt-2">
                  <Upload size={14} className="mr-2" />
                  Upload Avatar
                </Button>
              )}
            </div>
          </div>
        </CardContent> 
        </Card>

      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. JPG, PNG up to 5MB.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative w-32 h-32 rounded-full border-2 border-dashed transition-all duration-200 flex items-center justify-center overflow-hidden ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {preview ? (
                  <>
                    <Image
                      src={preview}
                      alt="Avatar preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <Camera size={28} className="text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      JPG, PNG up to 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload avatar"
                    />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="w-full sm:w-auto"
              >
                <Upload size={16} className="mr-2" />
                {file ? "Change Image" : "Choose Image"}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            {currentAvatar && (
              <Button
                variant="destructive"
                onClick={handleDeleteAvatar}
                disabled={avatarLoading}
              >
                <X size={16} className="mr-2" />
                Remove Avatar
              </Button>
            )}
            <Button onClick={handleSaveAvatar} disabled={avatarLoading || !file}>
              {avatarLoading ? "Saving..." : "Save Avatar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}