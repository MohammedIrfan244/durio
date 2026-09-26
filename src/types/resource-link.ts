export type ResourceType = "EVENT" | "TODO" | "NOTE" | "PROJECT" | "MENSTRUAL_CYCLE" | "MENSTRUAL_DAILY_LOG";

export interface IResourceLink {
    id: string;
    userId: string;
    fromId: string;
    fromType: ResourceType;
    toId: string;
    toType: ResourceType;
    createdAt: Date;
}

export interface ILinkedResource {
    linkId: string;
    resourceId: string;
    resourceType: ResourceType;
    title: string;
    subtitle?: string;
    color?: string;
    createdAt: Date;
}

export interface IResourceLinkInput {
    fromId: string;
    fromType: ResourceType;
    toId: string;
    toType: ResourceType;
}
