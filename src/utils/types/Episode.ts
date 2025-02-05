import {Media} from "./Media";
import {Feed} from "./Feed";

export interface Episode {
    id: number;
    documentId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    guid: string;
    audio: Media;
    feeds: Feed[];
    cover: Media;
}
