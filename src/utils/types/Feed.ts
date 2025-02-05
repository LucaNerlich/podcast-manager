import {Episode} from "./Episode";

export interface Feed {
    id: number;
    documentId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    data: string;
    email: string;
    copyright: string;
    owner: string;
    episodes: Episode[];
}
