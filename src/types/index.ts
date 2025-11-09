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
  metadata: {
    counterWords: number;
    cumulativeFrequency: number;
    entryDate: string;
    relatedTerms: string[];
    source: string;
  };
}
