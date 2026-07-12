"use client";

import React, { useState, useEffect } from "react";
import { ResourceType } from "@/types/resource-link";
import ResourceLinkerUI, { LinkableItem, LinkedItemDisplay } from "./resource-linker-ui";

export interface IUnsavedLinkedResource {
    id: string;
    type: ResourceType;
    title: string;
    subtitle?: string;
}

interface UnsavedResourceLinkerProps {
    allowedTargetTypes: ResourceType[];
    searchAction: (query: string, type: ResourceType) => Promise<{ id: string; title: string; subtitle?: string }[]>;
    value: IUnsavedLinkedResource[];
    onChange: (value: IUnsavedLinkedResource[]) => void;
}

export default function UnsavedResourceLinker({
    allowedTargetTypes,
    searchAction,
    value = [],
    onChange,
}: UnsavedResourceLinkerProps) {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<LinkableItem[]>([]);

    // Search handler
    useEffect(() => {
        if (!searchQuery.trim() || !isSearching) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const allResults: LinkableItem[] = [];
            for (const targetType of allowedTargetTypes) {
                const items = await searchAction(searchQuery, targetType);
                // Filter out already linked items
                const filtered = items
                    .filter(item => !value.some(l => l.id === item.id))
                    .map(item => ({ ...item, type: targetType }));
                allResults.push(...filtered);
            }
            setSearchResults(allResults);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, isSearching, allowedTargetTypes, searchAction, value]);

    const handleLink = (item: LinkableItem) => {
        onChange([...value, item]);
        setSearchQuery("");
        setIsSearching(false);
    };

    const handleUnlink = (id: string) => {
        onChange(value.filter(l => l.id !== id));
    };

    // Map the external controlled value into the format expected by ResourceLinkerUI
    const linkedItemsDisplay: LinkedItemDisplay[] = value.map(v => ({
        uniqueId: v.id, // For unsaved resources, the linkId doesn't exist yet, so we use the resource id
        resourceId: v.id,
        type: v.type,
        title: v.title,
        subtitle: v.subtitle
    }));

    return (
        <ResourceLinkerUI
            allowedTargetTypes={allowedTargetTypes}
            isSearching={isSearching}
            searchQuery={searchQuery}
            searchResults={searchResults}
            linkedItems={linkedItemsDisplay}
            loading={false}
            linking={false}
            onSearchChange={setSearchQuery}
            onSetSearching={setIsSearching}
            onLink={handleLink}
            onUnlink={handleUnlink}
        />
    );
}
