import { PrismaClient } from "../generated/prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface SeedData {
  words: Array<{
    baseWord: {
      text: string;
      language: string;
      article: string | null;
      stem: string | null;
      prefix: string | null;
      phonetics: string | null;
      wordType: string | null;
      languageSpecific?: {
        usageNotes: string | null;
      };
    };
    definitions: Array<{
      definitionId: string | null;
      text: string;
      synonyms: string[];
      examples: Array<{
        text: string;
        source: {
          title: string | null;
          publication: string | null;
          date: string | null;
        } | null;
      }>;
    }>;
    translations: Array<{
      language: string;
      text: string;
      article: string | null;
      stem: string | null;
      prefix: string | null;
      phonetics: string | null;
      languageSpecific?: {
        usageNotes: string | null;
      };
      definitions: Array<{
        text: string;
        synonyms: string[];
        examples: Array<{
          text: string;
          source: {
            title: string | null;
            publication: string | null;
            date: string | null;
          } | null;
        }>;
      }>;
    }>;
    metadata: {
      counterWords: number | null;
      cumulativeFrequency: number | null;
      entryDate: string | null;
      relatedTerms: string[];
      source: string | null;
    };
  }>;
}

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Read seed data
    const seedDataPath = path.join(__dirname, "../mock-data/seedDataSets.json");
    const seedDataRaw = fs.readFileSync(seedDataPath, "utf-8");
    const seedData: SeedData = JSON.parse(seedDataRaw);

    console.log(`📊 Found ${seedData.words.length} words to seed`);

    let wordCount = 0;

    // Process each word
    for (const wordData of seedData.words) {
      console.log(`\n📝 Processing word: ${wordData.baseWord.text}`);

      // Create LanguageSpecific for BaseWord if needed
      let baseWordLanguageSpecificId: string | undefined;
      if (wordData.baseWord.languageSpecific) {
        const baseWordLangSpec = await prisma.languageSpecific.create({
          data: {
            usageNotes: wordData.baseWord.languageSpecific.usageNotes,
          },
        });
        baseWordLanguageSpecificId = baseWordLangSpec.id;
      }

      // Create the Word with all nested relationships
      const createdWord = await prisma.word.create({
        data: {
          wordId: `word_${wordData.baseWord.text.toLowerCase()}_${Date.now()}`,
          // Create BaseWord
          baseWord: {
            create: {
              text: wordData.baseWord.text,
              language: wordData.baseWord.language as any,
              article: wordData.baseWord.article,
              stem: wordData.baseWord.stem,
              prefix: wordData.baseWord.prefix,
              phonetics: wordData.baseWord.phonetics,
              wordType: wordData.baseWord.wordType as any,
              languageSpecificId: baseWordLanguageSpecificId,
            },
          },
          // Create Definitions
          definitions: {
            create: wordData.definitions.map((def) => ({
              definitionId: def.definitionId,
              text: def.text,
              synonyms: def.synonyms,
              examples: {
                create: def.examples.map((ex) => ({
                  text: ex.text,
                  source: ex.source
                    ? {
                        create: {
                          title: ex.source.title,
                          publication: ex.source.publication,
                          date: ex.source.date
                            ? new Date(ex.source.date)
                            : null,
                        },
                      }
                    : undefined,
                })),
              },
            })),
          },
          // Create Translations
          translations: {
            create: await Promise.all(
              wordData.translations.map(async (trans) => {
                // Create LanguageSpecific for Translation if needed
                let translationLanguageSpecificId: string | undefined;
                if (trans.languageSpecific) {
                  const transLangSpec = await prisma.languageSpecific.create({
                    data: {
                      usageNotes: trans.languageSpecific.usageNotes,
                    },
                  });
                  translationLanguageSpecificId = transLangSpec.id;
                }

                return {
                  language: trans.language as any,
                  text: trans.text,
                  article: trans.article,
                  stem: trans.stem,
                  prefix: trans.prefix,
                  phonetics: trans.phonetics,
                  languageSpecificId: translationLanguageSpecificId,
                  definitions: {
                    create: trans.definitions.map((transDef) => ({
                      text: transDef.text,
                      synonyms: transDef.synonyms,
                      examples: {
                        create: transDef.examples.map((ex) => ({
                          text: ex.text,
                          source: ex.source
                            ? {
                                create: {
                                  title: ex.source.title,
                                  publication: ex.source.publication,
                                  date: ex.source.date
                                    ? new Date(ex.source.date)
                                    : null,
                                },
                              }
                            : undefined,
                        })),
                      },
                    })),
                  },
                };
              })
            ),
          },
          // Create Metadata
          metadata: {
            create: {
              counterWords: wordData.metadata.counterWords,
              cumulativeFrequency: wordData.metadata.cumulativeFrequency,
              entryDate: wordData.metadata.entryDate
                ? new Date(wordData.metadata.entryDate)
                : null,
              relatedTerms: wordData.metadata.relatedTerms,
              source: wordData.metadata.source,
            },
          },
        },
      });

      wordCount++;
      console.log(
        `✅ Created word: ${wordData.baseWord.text} (${wordCount}/${seedData.words.length})`
      );
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log(`📈 Total words seeded: ${wordCount}`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
