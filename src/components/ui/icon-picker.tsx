"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem,
  CommandList 
} from "@/components/ui/command";
import { 
  Folder, File, Star, Heart, Zap, Home, Briefcase, User, 
  Settings, Music, Video, Image, Camera, Cloud, Mail, 
  MessageCircle, Phone, Calendar, Clock, MapPin, Flag,
  AlertCircle, CheckCircle, XCircle, HelpCircle, Info,
  Menu, Grid, List, Search, Bell, Lock, Unlock,
  Edit, Trash, Plus, Minus, Hash, Tag, Bookmark,
  Link, ExternalLink, Share, Download, Upload,
  Eye, EyeOff, Smile, Frown, Meh, Sun, Moon,
  Monitor, Smartphone, Tablet, Laptop, Headphones,
  Speaker, Wifi, Bluetooth, Battery, Cpu, Database,
  Code, Terminal, GitBranch, GitCommit, GitMerge,
  Box, Package, Layers, Layout, Compass, Globe,
  Anchor, Coffee, Utensils, Beer, Wine, Archive,
  Trash2, FolderOpen, FolderPlus, FolderMinus, FileText,
  FileCode, FileSpreadsheet, FileImage, FileAudio, FileVideo,
  PenTool, Pen
} from "lucide-react";
import * as LucideIcons from "lucide-react";

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

// Curated list of icons for selection (names must match Lucide exports)
const AVAILABLE_ICONS = [
  "Folder", "FolderOpen", "FolderPlus", "File", "FileText", "Home", 
  "Briefcase", "User", "Heart", "Star", "Zap", "Settings", 
  "Calendar", "Clock", "Bell", "Tag", "Bookmark", "Flag",
  "Music", "Video", "Image", "Camera", "MapPin", "Mail",
  "MessageCircle", "Phone", "Globe", "Sun", "Moon", "Cloud",
  "Archive", "Trash2", "Lock", "Unlock", "Eye", "EyeOff",
  "CheckCircle", "AlertCircle", "HelpCircle", "Info", "Code", "Terminal",
  "Database", "Layout", "Layers", "Box", "Package", "Coffee",
  "Utensils", "Smile", "Frown", "Meh"
];

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic Icon component
  const SelectedIcon = value && (LucideIcons as any)[value] 
    ? (LucideIcons as any)[value] 
    : HelpCircle;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
             {value ? (
               <>
                 <SelectedIcon className="h-4 w-4" />
                 <span>{value}</span>
               </>
             ) : (
                <>
                  <Grid className="h-4 w-4" />
                  <span>Pick an icon</span>
                </>
             )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search icon..." />
          <CommandList>
              <CommandEmpty>No icon found.</CommandEmpty>
              <CommandGroup heading="Icons">
                <div className="grid grid-cols-5 gap-2 p-2">
                    {AVAILABLE_ICONS.map((iconName) => {
                        const Icon = (LucideIcons as any)[iconName];
                        if (!Icon) return null;
                        
                        return (
                            <div 
                                key={iconName}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                                    value === iconName && "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                                onClick={() => {
                                    onChange(iconName);
                                    setIsOpen(false);
                                }}
                                title={iconName}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                        )
                    })}
                </div>
              </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
