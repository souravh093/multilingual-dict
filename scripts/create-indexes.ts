import { PrismaClient } from "../generated/prisma/client";
import * as dotenv from "dotenv";

export const setupIndexes = async () => {
  dotenv.config();
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Setting up MongoDB indexes...");

    await prisma.$runCommandRaw({
      createIndexes: "BaseWord",
      indexes: [
        {
          key: { language: 1 },
          name: "idx_baseword_language",
        },
        {
          key: { text: "text" },
          name: "idx_baseword_text_fulltext",
        },
      ],
    });

    await prisma.$runCommandRaw({
      createIndexes: "Translation",
      indexes: [
        {
          key: { language: 1 },
          name: "idx_translation_language",
        },
        {
          key: { text: "text" },
          name: "idx_translation_text_fulltext",
        },
      ],
    });

    console.log("✅ Indexes successfully ensured");
  } catch (error) {
    console.error("❌ Index setup error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

setupIndexes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
