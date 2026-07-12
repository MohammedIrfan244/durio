"use client";

import React, { useState, useEffect, useCallback } from "react";
import { linkResources, unlinkResources, getLinkedResources } from "@/server/actions/resource-link-actions";
import { ResourceType } from "@/types/resource-link";
import { toast } from "sonner";
import ResourceLinkerUI, { LinkableItem, LinkedItemDisplay } from "./resource-linker-ui";

interface ResourceLinkerProps {
    resourceId: string;
    resourceType: ResourceType;
    /** Which resource types can be linked FROM this resource */
    allowedTargetTypes: ResourceType[];
    /** Server action to search for linkable resources */
    searchAction: (query: string, type: ResourceType) => Promise<{ id: string; title: string; subtitle?: string }[]>;
}

export default function ResourceLinker({
    resourceId,
    resourceType,
    allowedTargetTypes,
    searchAction,
}: ResourceLinkerProps) {
    const [linked, setLinked] = useState<LinkedItemDisplay[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<LinkableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);

    // Fetch linked resources on mount
    const fetchLinked = useCallback(async () => {
        setLoading(true);
        const results = await getLinkedResources(resourceId, resourceType);
        setLinked(results.map(r => ({
            uniqueId: r.linkId,
            resourceId: r.resourceId,
            type: r.resourceType,
            title: r.title,
            subtitle: r.subtitle
        })));
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
            const allResults: LinkableItem[] = [];
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

    const handleLink = async (item: LinkableItem) => {
        setLinking(true);
        const result = await linkResources({
            fromId: resourceId,
            fromType: resourceType,
            toId: item.id,
            toType: item.type,
        });

        if (result.success) {
            toast.success("Boom! Linked.");
            await fetchLinked();
            setSearchQuery("");
            setIsSearching(false);
        } else {
            toast.error(result.error || "Uh oh, couldn't link that.");
        }
        setLinking(false);
    };

    const handleUnlink = async (linkId: string) => {
        const result = await unlinkResources(linkId);
        if (result.success) {
            toast.success("Link severed.");
            setLinked(prev => prev.filter(l => l.uniqueId !== linkId));
        } else {
            toast.error(result.error || "Stuck together! Couldn't unlink.");
        }
    };

    return (
        <ResourceLinkerUI
            allowedTargetTypes={allowedTargetTypes}
            isSearching={isSearching}
            searchQuery={searchQuery}
            searchResults={searchResults}
            linkedItems={linked}
            loading={loading}
            linking={linking}
            onSearchChange={setSearchQuery}
            onSetSearching={setIsSearching}
            onLink={handleLink}
            onUnlink={handleUnlink}
        />
    );
}
