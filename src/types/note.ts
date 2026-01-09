import { NoteStatus } from "@/schema/note";

export type INoteStatus = NoteStatus;

export interface INote {
	id: string;
	userId: string;
	folderId?: string | null;
	heading: string;
	description: string;
	status: INoteStatus;
	color?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface INoteFolder {
	id: string;
	userId: string;
	name: string;
	color: string;
	icon?: string | null;
	notes?: INote[];
    _count?: {
        notes: number;
    };
	createdAt: Date;
	updatedAt: Date;
}

export interface IGetNoteList {
	id: string;
	heading: string;
	description: string;
	status: INoteStatus;
	folderId?: string | null;
	color?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface IGetArchivedNoteList {
	id: string;
	heading: string;
}

export type IGetArchivedNoteListPayload = IGetArchivedNoteList[];

export interface IGetNoteListPayload {
	active: IGetNoteList[];
    folders : INoteFolder[]
}
