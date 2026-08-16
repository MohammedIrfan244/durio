"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, X, Camera } from "lucide-react";
import { uploadAvatar } from "@/server/actions/upload-action";
import Image from "next/image";

export default function AvatarOnboarding() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If logged in and no avatar, show modal (after timezone is set)
    if (session?.user && !session.user.avatar && session.user.timezone) {
      setOpen(true);
    }
  }, [session]);

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
    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setFile(selectedFile);

    // Create preview
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

  const handleSave = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
try {
  const result = await uploadAvatar({ file });

  if (!result.success) {
    toast.error(result.error?.message || "Ooops.. Failed to upload avatar");
    return;
  }

  await update({ avatar: result.data });
  toast.success("Avatar uploaded successfully!");
  setOpen(false);
  router.refresh();
} catch (error) {
  console.error(error);
  toast.error("Oops.."+ (error instanceof Error ? `: ${error.message}` : ""));
} finally {
  setLoading(false);
}
  };

  // const handleSkip = async () => {
  //   setOpen(false);
  //   router.refresh();
  // };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      {/* Empty onOpenChange prevents closing by clicking outside/ESC, making it blocking */}
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Add your Profile Picture</DialogTitle>
          <DialogDescription>
            Personalize your account with a profile picture. You can change this later in Settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            {/* Upload Area */}
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
                    fill
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

            {/* Upload Button */}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Upload size={16} className="mr-2" />
              {file ? "Change Image" : "Choose Image"}
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} disabled={loading || !file}>
            {loading ? "Uploading..." : "Save Avatar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}