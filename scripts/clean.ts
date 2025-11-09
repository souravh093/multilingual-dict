import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log(
    "🧹 Prisma DB cleaner — will delete all documents from all models."
  );

  if (!process.argv.includes("--yes")) {
    console.log(
      "⚠️  Dry run: no changes made. To actually delete data, re-run with --yes flag."
    );
    console.log("Example: ts-node --transpile-only scripts/clean.ts --yes");
    console.log("Or via npm: npm run prisma:clean");
    process.exit(0);
  }

  console.log("⏳ Deleting documents (this may take a moment)...");

  try {
    console.log("  🗑️  Deleting Examples...");
    const examplesDeleted = await prisma.example.deleteMany();
    console.log(`     ✅ Deleted ${examplesDeleted.count} examples`);

    console.log("  🗑️  Deleting ExampleSources...");
    const exampleSourcesDeleted = await prisma.exampleSource.deleteMany();
    console.log(
      `     ✅ Deleted ${exampleSourcesDeleted.count} example sources`
    );

    console.log("  🗑️  Deleting TranslationDefinitions...");
    const translationDefsDeleted =
      await prisma.translationDefinition.deleteMany();
    console.log(
      `     ✅ Deleted ${translationDefsDeleted.count} translation definitions`
    );

    console.log("  🗑️  Deleting Definitions...");
    const definitionsDeleted = await prisma.definition.deleteMany();
    console.log(`     ✅ Deleted ${definitionsDeleted.count} definitions`);

    console.log("  🗑️  Deleting Translations...");
    const translationsDeleted = await prisma.translation.deleteMany();
    console.log(`     ✅ Deleted ${translationsDeleted.count} translations`);

    console.log("  🗑️  Deleting LanguageSpecific...");
    const languageSpecificDeleted = await prisma.languageSpecific.deleteMany();
    console.log(
      `     ✅ Deleted ${languageSpecificDeleted.count} language specific entries`
    );

    console.log("  🗑️  Deleting BaseWords...");
    const baseWordsDeleted = await prisma.baseWord.deleteMany();
    console.log(`     ✅ Deleted ${baseWordsDeleted.count} base words`);

    console.log("  🗑️  Deleting Metadata...");
    const metadataDeleted = await prisma.metadata.deleteMany();
    console.log(`     ✅ Deleted ${metadataDeleted.count} metadata entries`);

    console.log("  🗑️  Deleting Words...");
    const wordsDeleted = await prisma.word.deleteMany();
    console.log(`     ✅ Deleted ${wordsDeleted.count} words`);

    console.log("\n✨ All documents deleted successfully!");
    console.log("📊 Summary:");
    console.log(`   - Words: ${wordsDeleted.count}`);
    console.log(`   - Base Words: ${baseWordsDeleted.count}`);
    console.log(`   - Definitions: ${definitionsDeleted.count}`);
    console.log(`   - Translations: ${translationsDeleted.count}`);
    console.log(
      `   - Translation Definitions: ${translationDefsDeleted.count}`
    );
    console.log(`   - Examples: ${examplesDeleted.count}`);
    console.log(`   - Example Sources: ${exampleSourcesDeleted.count}`);
    console.log(`   - Language Specific: ${languageSpecificDeleted.count}`);
    console.log(`   - Metadata: ${metadataDeleted.count}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
