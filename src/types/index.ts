export interface TWordData {
    wordId: string;
    language: string;
    text: string;
    article: string | null;
    stem: string | null;
    phonetics: string | null;
    definitions: Array<{
        text: string;
        synonyms: string[];
        examples: string[];
    }>;
}