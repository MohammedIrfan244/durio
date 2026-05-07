"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link2, Search, X, StickyNote, CheckCircle, CalendarDays, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { linkResources, unlinkResources, getLinkedResources } from "@/server/actions/resource-link-actions";
import { ResourceType, ILinkedResource } from "@/types/resource-link";
import { toast } from "sonner";

interface ResourceLinkerProps {
    resourceId: string;
    resourceType: ResourceType;
    /** Which resource types can be linked FROM this resource */
    allowedTargetTypes: ResourceType[];
    /** Server action to search for linkable resources */
    searchAction: (query: string, type: ResourceType) => Promise<{ id: string; title: string; subtitle?: string }[]>;
}

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
    NOTE: <StickyNote className="w-3.5 h-3.5" />,
    TODO: <CheckCircle className="w-3.5 h-3.5" />,
    EVENT: <CalendarDays className="w-3.5 h-3.5" />,
    PROJECT: <CalendarDays className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<ResourceType, string> = {
    NOTE: "text-pink-400",
    TODO: "text-blue-400",
    EVENT: "text-amber-400",
    PROJECT: "text-orange-400",
};

const TYPE_LABELS: Record<ResourceType, string> = {
    NOTE: "Note",
    TODO: "Task",
    EVENT: "Event",
    PROJECT: "Project",
};

export default function ResourceLinker({
    resourceId,
    resourceType,
    allowedTargetTypes,
    searchAction,
}: ResourceLinkerProps) {
    const [linked, setLinked] = useState<ILinkedResource[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: string; title: string; subtitle?: string; type: ResourceType }[]>([]);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);

    // Fetch linked resources on mount
    const fetchLinked = useCallback(async () => {
        setLoading(true);
        const results = await getLinkedResources(resourceId, resourceType);
        setLinked(results);
        setLoading(false);
    }, [resourceId, resourceType]);

    useEffect(() => {
        fetchLinked();
    }, [fetchLinked]);

    // Search handler
    useEffect(() => {
        if (!searchQuery.trim() || !isSearching) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const allResults: { id: string; title: string; subtitle?: string; type: ResourceType }[] = [];
            for (const targetType of allowedTargetTypes) {
                const items = await searchAction(searchQuery, targetType);
                // Filter out already linked items and self
                const filtered = items
                    .filter(item => item.id !== resourceId)
                    .filter(item => !linked.some(l => l.resourceId === item.id))
                    .map(item => ({ ...item, type: targetType }));
                allResults.push(...filtered);
            }
            setSearchResults(allResults);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, isSearching, allowedTargetTypes, searchAction, resourceId, linked]);

    const handleLink = async (targetId: string, targetType: ResourceType) => {
        setLinking(true);
        const result = await linkResources({
            fromId: resourceId,
            fromType: resourceType,
            toId: targetId,
            toType: targetType,
        });

        if (result.success) {
            toast.success("Linked successfully");
            await fetchLinked();
            setSearchQuery("");
            setIsSearching(false);
        } else {
            toast.error(result.error || "Failed to link");
        }
        setLinking(false);
    };

    const handleUnlink = async (linkId: string) => {
        const result = await unlinkResources(linkId);
        if (result.success) {
            toast.success("Unlinked");
            setLinked(prev => prev.filter(l => l.linkId !== linkId));
        } else {
            toast.error(result.error || "Failed to unlink");
        }
    };

    return (
        <div className="space-y-3 col-span-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    Linked Resources
                </label>
                {!isSearching && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsSearching(true)}
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${allowedTargetTypes.map(t => TYPE_LABELS[t] + "s").join(", ")}...`}
                            className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 shadow-none px-0"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => { setIsSearching(false); setSearchQuery(""); setSearchResults([]); }}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>

                    {/* Results */}
                    {searchResults.length > 0 && (
                        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                            {searchResults.map((item) => (
                                <button
                                    key={`${item.type}-${item.id}`}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background/60 text-left transition-colors text-sm w-full"
                                    onClick={() => handleLink(item.id, item.type)}
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
                        <p className="text-xs text-muted-foreground text-center py-2">No results found</p>
                    )}
                </div>
            )}

            {/* Linked Items Display */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
            ) : linked.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                    {linked.map((item) => (
                        <div
                            key={item.linkId}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/40 transition-colors group"
                        >
                            <span className={TYPE_COLORS[item.resourceType]}>
                                {TYPE_ICONS[item.resourceType]}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.title}</p>
                                {item.subtitle && (
                                    <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                                )}
                            </div>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {TYPE_LABELS[item.resourceType]}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={() => handleUnlink(item.linkId)}
                            >
                                <Unlink className="w-3 h-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-2 italic">
                    No linked resources yet
                </p>
            )}
        </div>
    );
}
