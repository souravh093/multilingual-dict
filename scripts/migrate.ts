import { PrismaClient, Language } from "../generated/prisma/client";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { TWordData } from "../src/types";

dotenv.config();
const prisma = new PrismaClient();

// Helper to load JSON
async function loadJsonData(fileName: string): Promise<TWordData[]> {
  const fullPath = path.join(__dirname, "../mock-data/db", fileName);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data) as TWordData[];
}

async function migrate() {
  try {
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
      allData.reduce((acc: Record<string, TWordData[]>, word) => {
        if (!word.wordId) {
          console.warn(`⚠️ Skipping word with missing wordId: ${word.text}`);
          return acc;
        }
        if (!acc[word.wordId]) acc[word.wordId] = [];
        acc[word.wordId].push(word);
        return acc;
      }, {})
    );

    console.log(`✅ Found ${wordGroups.length} word groups`);

    // Iterate over word groups
    for (const group of wordGroups) {
      if (group.length === 0) continue;

      // Prefer English as the base word, otherwise take first
      const baseWordData = group.find((w) => w.language === "en") || group[0];
      const translations = group.filter(
        (w) => w.language !== baseWordData.language
      );

      // Create metadata if exists
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
      }

      // Create Word entry using provided `wordId`.
      let word;
      try {
        word = await prisma.word.create({
          data: {
            wordId: baseWordData.wordId,
            metadata: metadata ? { connect: { id: metadata.id } } : undefined,
          },
        });
      } catch (err: any) {
        if (err?.code === "P2002") {
          word = await prisma.word.findUnique({
            where: { wordId: baseWordData.wordId },
          });
          if (!word) throw err;
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
          language: baseWordData.language.toLowerCase() as Language,
          word: { connect: { id: word.id } },
        },
      });

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

        for (const example of def.examples) {
          await prisma.example.create({
            data: {
              text: example,
              definition: { connect: { id: createdDef.id } },
            },
          });
        }
      }

      // Create Translations and their definitions
      for (const trans of translations) {
        const createdTranslation = await prisma.translation.create({
          data: {
            language: trans.language.toLowerCase() as Language,
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
      }

      console.log(
        `✅ Migrated group: ${baseWordData.wordId} (${baseWordData.text})`
      );
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
