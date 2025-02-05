import {Episode} from "./Episode";

export interface Feed {
    id: number;
    documentId: string;
    title: string;
    description: string;
    slug: string;
    public: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    data: string; // cache / the actual rss feed xml as a string
    email: string;
    copyright: string;
    owner: string;
    episodes: Episode[];
}
