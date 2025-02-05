import {MediaFormats} from "./MediaFormats";

export interface Media {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
    formats: MediaFormats | null;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: unknown | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}
