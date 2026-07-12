"use client";

import React from "react";
import { Link2, Search, X, StickyNote, CheckCircle, CalendarDays, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourceType } from "@/types/resource-link";

export const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
    NOTE: <StickyNote className="w-3.5 h-3.5" />,
    TODO: <CheckCircle className="w-3.5 h-3.5" />,
    EVENT: <CalendarDays className="w-3.5 h-3.5" />,
    PROJECT: <CalendarDays className="w-3.5 h-3.5" />,
};

export const TYPE_COLORS: Record<ResourceType, string> = {
    NOTE: "text-pink-400",
    TODO: "text-blue-400",
    EVENT: "text-amber-400",
    PROJECT: "text-orange-400",
};

export const TYPE_LABELS: Record<ResourceType, string> = {
    NOTE: "Note",
    TODO: "Task",
    EVENT: "Event",
    PROJECT: "Project",
};

export interface LinkableItem {
    id: string;
    type: ResourceType;
    title: string;
    subtitle?: string;
}

export interface LinkedItemDisplay {
    uniqueId: string;
    resourceId?: string;
    type: ResourceType;
    title: string;
    subtitle?: string;
}

interface ResourceLinkerUIProps {
    allowedTargetTypes: ResourceType[];
    isSearching: boolean;
    searchQuery: string;
    searchResults: LinkableItem[];
    linkedItems: LinkedItemDisplay[];
    loading: boolean;
    linking: boolean;
    onSearchChange: (query: string) => void;
    onSetSearching: (isSearching: boolean) => void;
    onLink: (item: LinkableItem) => void;
    onUnlink: (uniqueId: string) => void;
}

export default function ResourceLinkerUI({
    allowedTargetTypes,
    isSearching,
    searchQuery,
    searchResults,
    linkedItems,
    loading,
    linking,
    onSearchChange,
    onSetSearching,
    onLink,
    onUnlink,
}: ResourceLinkerUIProps) {
    return (
        <div className="space-y-3 col-span-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    Linked Resources
                </label>
                {!isSearching && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => onSetSearching(true)}
                    >
                        <Link2 className="w-3 h-3 mr-1" />
                        Link
                    </Button>
                )}
            </div>

            {/* Search Panel */}
            {isSearching && (
                <div className="bg-secondary/30 rounded-lg border border-border/40 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search ${allowedTargetTypes.map(t => TYPE_LABELS[t] + "s").join(", ")}...`}
                            className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 shadow-none px-0"
                            autoFocus
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => { onSetSearching(false); onSearchChange(""); }}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>

                    {/* Results */}
                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                            {searchResults.map((item) => (
                                <button
                                    type="button"
                                    key={`${item.type}-${item.id}`}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background/60 text-left transition-colors text-sm w-full"
                                    onClick={() => onLink(item)}
                                    disabled={linking}
                                >
                                    <span className={TYPE_COLORS[item.type]}>
                                        {TYPE_ICONS[item.type]}
                                    </span>
                                    <span className="truncate flex-1 font-medium">{item.title}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {TYPE_LABELS[item.type]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">Couldn't find anything matching that!</p>
                    )}
                </div>
            )}

            {/* Linked Items Display */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
            ) : linkedItems.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                    {linkedItems.map((item) => (
                        <div
                            key={item.uniqueId}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/40 transition-colors group"
                        >
                            <span className={TYPE_COLORS[item.type]}>
                                {TYPE_ICONS[item.type]}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.title}</p>
                                {item.subtitle && (
                                    <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                                )}
                            </div>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {TYPE_LABELS[item.type]}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={() => onUnlink(item.uniqueId)}
                            >
                                <Unlink className="w-3 h-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-2 italic">
                    It's a bit lonely here. No links yet.
                </p>
            )}
        </div>
    );
}
