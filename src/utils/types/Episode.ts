import {Media} from "./Media";
import {Feed} from "./Feed";

export interface Episode {
    id: number;
    documentId: string;
    title: string;
    link: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    duration: number;
    guid: string;
    audio: Media;
    feeds: Feed[];
    cover: Media;
}
