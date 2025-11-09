import { PrismaClient, Language, WordType } from "../generated/prisma/client";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Interface for the new data structure
interface WordData {
  wordId: string;
  language: string;
  text: string;
  article: string | null;
  stem: string | null;
  phonetics: string | null;
  wordType?: string;
  definitions: Array<{
    text: string;
    synonyms: string[];
    examples: string[];
  }>;
  metadata?: {
    counterWords: number;
    cumulativeFrequency: number;
    entryDate: string;
    relatedTerms: string[];
    source: string;
  };
}

// Helper to load JSON
async function loadJsonData(fileName: string): Promise<WordData[]> {
  const fullPath = path.join(__dirname, "../mock-data/db", fileName);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data) as WordData[];
}

// Helper to convert language string to Language enum
function getLanguageEnum(lang: string): Language {
  const normalizedLang = lang.toLowerCase();
  if (normalizedLang in Language) {
    return Language[normalizedLang as keyof typeof Language];
  }
  throw new Error(`Invalid language: ${lang}`);
}

// Helper to convert wordType string to WordType enum
function getWordTypeEnum(type?: string): WordType | undefined {
  if (!type) return undefined;
  const normalizedType = type.toUpperCase();
  if (normalizedType in WordType) {
    return WordType[normalizedType as keyof typeof WordType];
  }
  return WordType.OTHER;
}

async function migrate() {
  try {
    console.log("🚀 Starting migration...");

    // Load all language datasets
    const [enData, deData, itData, esData] = await Promise.all([
      loadJsonData("en.json"),
      loadJsonData("de.json"),
      loadJsonData("it.json"),
      loadJsonData("es.json"),
    ]);

    // Group words by `wordId`
    const allData = [...enData, ...deData, ...itData, ...esData];
    const wordGroups = Object.values(
      allData.reduce((acc: Record<string, WordData[]>, word) => {
        if (!word.wordId) {
          console.warn(`⚠️  Skipping word with missing wordId: ${word.text}`);
          return acc;
        }
        if (!acc[word.wordId]) acc[word.wordId] = [];
        acc[word.wordId].push(word);
        return acc;
      }, {})
    );

    console.log(`✅ Found ${wordGroups.length} unique word groups`);
    console.log(`📊 Total entries: ${allData.length}\n`);

    // Iterate over word groups
    for (let i = 0; i < wordGroups.length; i++) {
      const group = wordGroups[i];
      if (group.length === 0) continue;

      // Prefer English as the base word, otherwise take first
      const baseWordData = group.find((w) => w.language === "en") || group[0];
      const translations = group.filter(
        (w) => w.language !== baseWordData.language
      );

      console.log(
        `[${i + 1}/${wordGroups.length}] Processing: ${baseWordData.wordId} - ${
          baseWordData.text
        } (${baseWordData.language})`
      );
      console.log(`   Translations found: ${translations.length}`);

      // Create metadata if exists (only for base word with English data)
      let metadata;
      if (baseWordData.metadata) {
        metadata = await prisma.metadata.create({
          data: {
            counterWords: baseWordData.metadata.counterWords,
            cumulativeFrequency: baseWordData.metadata.cumulativeFrequency,
            entryDate: baseWordData.metadata.entryDate
              ? new Date(baseWordData.metadata.entryDate)
              : undefined,
            relatedTerms: baseWordData.metadata.relatedTerms || [],
            source: baseWordData.metadata.source || null,
          },
        });
        console.log(`   ✓ Metadata created`);
      }

      // Create Word entry using provided `wordId`
      let word;
      try {
        word = await prisma.word.create({
          data: {
            wordId: baseWordData.wordId,
            metadata: metadata ? { connect: { id: metadata.id } } : undefined,
          },
        });
        console.log(`   ✓ Word entry created`);
      } catch (err: any) {
        // Handle duplicate wordId
        if (err?.code === "P2002") {
          console.log(
            `   ⚠️  Word with wordId ${baseWordData.wordId} already exists, skipping...`
          );
          continue;
        } else {
          throw err;
        }
      }

      // Create BaseWord
      const baseWord = await prisma.baseWord.create({
        data: {
          text: baseWordData.text,
          article: baseWordData.article || null,
          stem: baseWordData.stem || null,
          phonetics: baseWordData.phonetics || null,
          wordType: getWordTypeEnum(baseWordData.wordType),
          language: getLanguageEnum(baseWordData.language),
          word: { connect: { id: word.id } },
        },
      });
      console.log(`   ✓ BaseWord created`);

      // Connect BaseWord back to Word
      await prisma.word.update({
        where: { id: word.id },
        data: { baseWordId: baseWord.id },
      });

      // Create definitions for the base word
      for (const def of baseWordData.definitions) {
        const createdDef = await prisma.definition.create({
          data: {
            text: def.text,
            synonyms: def.synonyms || [],
            word: { connect: { id: word.id } },
          },
        });

        // Create examples for each definition
        for (const example of def.examples) {
          await prisma.example.create({
            data: {
              text: example,
              definition: { connect: { id: createdDef.id } },
            },
          });
        }
      }
      console.log(
        `   ✓ Definitions (${baseWordData.definitions.length}) and examples created`
      );

      // Create Translations and their definitions
      for (const trans of translations) {
        const createdTranslation = await prisma.translation.create({
          data: {
            language: getLanguageEnum(trans.language),
            text: trans.text,
            article: trans.article || null,
            stem: trans.stem || null,
            phonetics: trans.phonetics || null,
            word: { connect: { id: word.id } },
          },
        });

        for (const def of trans.definitions) {
          const createdTransDef = await prisma.translationDefinition.create({
            data: {
              text: def.text,
              synonyms: def.synonyms || [],
              translation: { connect: { id: createdTranslation.id } },
            },
          });

          for (const example of def.examples) {
            await prisma.example.create({
              data: {
                text: example,
                translationDefinition: { connect: { id: createdTransDef.id } },
              },
            });
          }
        }
        console.log(
          `   ✓ Translation (${trans.language}) with definitions created`
        );
      }

      console.log(`   ✅ Completed: ${baseWordData.wordId}\n`);
    }

    console.log("🎉 Migration completed successfully!");
    console.log(`📈 Total word groups migrated: ${wordGroups.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
