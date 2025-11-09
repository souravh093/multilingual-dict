import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config();
const prisma = new PrismaClient();

/**
 * Safe Prisma-based DB cleaner.
 * Usage (requires confirmation flag):
 *   ts-node --transpile-only scripts/clean.ts --yes
 * or via npm:
 *   npx ts-node --transpile-only scripts/clean.ts --yes
 *
 * IMPORTANT: This permanently deletes data. BACKUP your DB before running.
 */

async function main() {
  console.log("Prisma DB cleaner — will delete all documents from all models.");

  if (!process.argv.includes("--yes")) {
    console.log(
      "Dry run: no changes made. To actually delete data, re-run with --yes flag."
    );
    console.log("Example: ts-node --transpile-only scripts/clean.ts --yes");
    process.exit(0);
  }

  console.log("Deleting documents (this may take a moment)...");

  // Delete in an order that avoids referential surprises. For MongoDB via Prisma
  // deleteMany is sufficient to remove documents; relations are represented via ids.
  await prisma.example.deleteMany();
  await prisma.translationDefinition.deleteMany();
  await prisma.definition.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.baseWord.deleteMany();
  await prisma.exampleSource.deleteMany();
  await prisma.languageSpecific.deleteMany();
  await prisma.metadata.deleteMany();
  await prisma.word.deleteMany();

  console.log("All documents deleted via Prisma deleteMany().");
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
