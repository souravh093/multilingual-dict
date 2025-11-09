import prisma from "../src/prisma";
import { Language } from "../generated/prisma/client";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Benchmark Configuration
 */
const BENCHMARK_CONFIG = {
  warmupRuns: 3,
  measurementRuns: 10,
  cooldownTime: 100, // ms between runs
};

/**
 * Utility function to measure execution time
 */
async function measureQueryTime(
  queryFn: () => Promise<any>,
  queryName: string
): Promise<{
  avgTime: number;
  minTime: number;
  maxTime: number;
  runs: number[];
}> {
  const times: number[] = [];

  // Warmup runs (not counted in results)
  console.log(`  ⏳ Warming up ${queryName}...`);
  for (let i = 0; i < BENCHMARK_CONFIG.warmupRuns; i++) {
    await queryFn();
    await sleep(BENCHMARK_CONFIG.cooldownTime);
  }

  // Measurement runs
  console.log(`  📊 Running ${queryName} benchmark...`);
  for (let i = 0; i < BENCHMARK_CONFIG.measurementRuns; i++) {
    const startTime = performance.now();
    await queryFn();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    times.push(executionTime);

    process.stdout.write(
      `    Run ${i + 1}/${
        BENCHMARK_CONFIG.measurementRuns
      }: ${executionTime.toFixed(2)}ms\r`
    );
    await sleep(BENCHMARK_CONFIG.cooldownTime);
  }
  console.log(""); // New line after progress

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return { avgTime, minTime, maxTime, runs: times };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate statistics
 */
function calculateStats(times: number[]) {
  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const stdDev = Math.sqrt(
    times.reduce(
      (sum, time) =>
        sum +
        Math.pow(time - times.reduce((a, b) => a + b, 0) / times.length, 2),
      0
    ) / times.length
  );
  return { median, stdDev };
}

/**
 * Benchmark 1: Find English base word + corresponding German translation
 * This query tests the ability to find a word and its translation across different languages
 */
async function benchmark1_FindWordWithTranslation() {
  const result = await prisma.word.findFirst({
    where: {
      baseWord: {
        language: Language.en,
        text: {
          contains: "hello",
        },
      },
    },
    include: {
      baseWord: true,
      translations: {
        where: {
          language: Language.de,
        },
        include: {
          languageSpecific: true,
          definitions: {
            include: {
              examples: true,
            },
          },
        },
      },
      definitions: {
        include: {
          examples: true,
        },
      },
    },
  });

  return result;
}

/**
 * Benchmark 2: Prefix search on baseWord.text
 * This tests the efficiency of partial text matching, useful for autocomplete features
 */
async function benchmark2_PrefixSearch() {
  const searchPrefix = "hel";

  const results = await prisma.baseWord.findMany({
    where: {
      text: {
        startsWith: searchPrefix,
      },
    },
    include: {
      word: {
        include: {
          translations: {
            take: 5,
          },
          definitions: {
            take: 3,
          },
        },
      },
      languageSpecific: true,
    },
    take: 20,
  });

  return results;
}

/**
 * Benchmark 3: Search for translations by language + text
 * This tests finding all translations in a specific language matching a text pattern
 */
async function benchmark3_SearchTranslationsByLanguageAndText() {
  const searchLanguage = Language.de;
  const searchText = "hallo";

  const results = await prisma.translation.findMany({
    where: {
      language: searchLanguage,
      text: {
        contains: searchText,
      },
    },
    include: {
      word: {
        include: {
          baseWord: true,
        },
      },
      definitions: {
        include: {
          examples: {
            take: 2,
          },
        },
        take: 3,
      },
      languageSpecific: true,
    },
    take: 20,
  });

  return results;
}

/**
 * Main benchmark runner
 */
async function runBenchmarks() {
  console.log("\n🚀 Starting Multilingual Dictionary Benchmark Suite\n");
  console.log(`Configuration:`);
  console.log(`  - Warmup runs: ${BENCHMARK_CONFIG.warmupRuns}`);
  console.log(`  - Measurement runs: ${BENCHMARK_CONFIG.measurementRuns}`);
  console.log(`  - Cooldown time: ${BENCHMARK_CONFIG.cooldownTime}ms\n`);

  const results: any[] = [];

  try {
    // Benchmark 1
    console.log(
      "📌 Benchmark 1: Find English base word + corresponding German translation"
    );
    const bench1 = await measureQueryTime(
      benchmark1_FindWordWithTranslation,
      "English word → German translation"
    );
    const bench1Stats = calculateStats(bench1.runs);
    results.push({
      name: "Find English base word + German translation",
      description:
        "Find an English word and retrieve its German translations with all related data",
      ...bench1,
      ...bench1Stats,
    });
    console.log(
      `  ✅ Average: ${bench1.avgTime.toFixed(
        2
      )}ms | Min: ${bench1.minTime.toFixed(
        2
      )}ms | Max: ${bench1.maxTime.toFixed(2)}ms\n`
    );

    // Benchmark 2
    console.log("📌 Benchmark 2: Prefix search on baseWord.text");
    const bench2 = await measureQueryTime(
      benchmark2_PrefixSearch,
      "Prefix search"
    );
    const bench2Stats = calculateStats(bench2.runs);
    results.push({
      name: "Prefix search on baseWord.text",
      description:
        "Search for base words starting with a specific prefix (autocomplete use case)",
      ...bench2,
      ...bench2Stats,
    });
    console.log(
      `  ✅ Average: ${bench2.avgTime.toFixed(
        2
      )}ms | Min: ${bench2.minTime.toFixed(
        2
      )}ms | Max: ${bench2.maxTime.toFixed(2)}ms\n`
    );

    // Benchmark 3
    console.log("📌 Benchmark 3: Search for translations by language + text");
    const bench3 = await measureQueryTime(
      benchmark3_SearchTranslationsByLanguageAndText,
      "Translation search by language"
    );
    const bench3Stats = calculateStats(bench3.runs);
    results.push({
      name: "Search translations by language + text",
      description:
        "Find translations in a specific language containing search text",
      ...bench3,
      ...bench3Stats,
    });
    console.log(
      `  ✅ Average: ${bench3.avgTime.toFixed(
        2
      )}ms | Min: ${bench3.minTime.toFixed(
        2
      )}ms | Max: ${bench3.maxTime.toFixed(2)}ms\n`
    );

    // Generate results summary
    console.log("=".repeat(80));
    console.log("📊 BENCHMARK RESULTS SUMMARY");
    console.log("=".repeat(80));

    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   Description: ${result.description}`);
      console.log(`   Average Time: ${result.avgTime.toFixed(2)}ms`);
      console.log(`   Median Time:  ${result.median.toFixed(2)}ms`);
      console.log(`   Min Time:     ${result.minTime.toFixed(2)}ms`);
      console.log(`   Max Time:     ${result.maxTime.toFixed(2)}ms`);
      console.log(`   Std Dev:      ${result.stdDev.toFixed(2)}ms`);
    });

    console.log("\n" + "=".repeat(80));

    // Write results to markdown file
    await writeResultsToMarkdown(results);

    console.log(
      "\n✅ Benchmark completed! Results saved to bench/results.md\n"
    );
  } catch (error) {
    console.error("\n❌ Error running benchmarks:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Write benchmark results to markdown file
 */
async function writeResultsToMarkdown(results: any[]) {
  const fs = require("fs").promises;
  const path = require("path");

  const now = new Date();
  const timestamp = now.toISOString();

  let markdown = `# Multilingual Dictionary - Benchmark Results\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  markdown += `**Configuration:**\n`;
  markdown += `- Warmup Runs: ${BENCHMARK_CONFIG.warmupRuns}\n`;
  markdown += `- Measurement Runs: ${BENCHMARK_CONFIG.measurementRuns}\n`;
  markdown += `- Cooldown Time: ${BENCHMARK_CONFIG.cooldownTime}ms\n\n`;

  markdown += `---\n\n`;

  markdown += `## Summary Table\n\n`;
  markdown += `| Benchmark | Avg (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev (ms) |\n`;
  markdown += `|-----------|----------|-------------|----------|----------|-------------|\n`;

  results.forEach((result) => {
    markdown += `| ${result.name} | ${result.avgTime.toFixed(
      2
    )} | ${result.median.toFixed(2)} | ${result.minTime.toFixed(
      2
    )} | ${result.maxTime.toFixed(2)} | ${result.stdDev.toFixed(2)} |\n`;
  });

  markdown += `\n---\n\n`;

  markdown += `## Detailed Results\n\n`;

  results.forEach((result, index) => {
    markdown += `### ${index + 1}. ${result.name}\n\n`;
    markdown += `**Description:** ${result.description}\n\n`;
    markdown += `**Performance Metrics:**\n`;
    markdown += `- **Average Time:** ${result.avgTime.toFixed(2)}ms\n`;
    markdown += `- **Median Time:** ${result.median.toFixed(2)}ms\n`;
    markdown += `- **Min Time:** ${result.minTime.toFixed(2)}ms\n`;
    markdown += `- **Max Time:** ${result.maxTime.toFixed(2)}ms\n`;
    markdown += `- **Standard Deviation:** ${result.stdDev.toFixed(2)}ms\n\n`;

    markdown += `**Individual Run Times (ms):**\n\n`;
    markdown += `\`\`\`\n`;
    result.runs.forEach((time: number, runIndex: number) => {
      markdown += `Run ${runIndex + 1}: ${time.toFixed(2)}ms\n`;
    });
    markdown += `\`\`\`\n\n`;

    markdown += `**Query Details:**\n\n`;

    if (index === 0) {
      markdown += `\`\`\`typescript\n`;
      markdown += `// Find English word and retrieve German translations\n`;
      markdown += `prisma.word.findFirst({\n`;
      markdown += `  where: {\n`;
      markdown += `    baseWord: {\n`;
      markdown += `      language: Language.en,\n`;
      markdown += `      text: { contains: "hello" }\n`;
      markdown += `    }\n`;
      markdown += `  },\n`;
      markdown += `  include: {\n`;
      markdown += `    baseWord: true,\n`;
      markdown += `    translations: {\n`;
      markdown += `      where: { language: Language.de },\n`;
      markdown += `      include: { languageSpecific: true, definitions: { include: { examples: true } } }\n`;
      markdown += `    },\n`;
      markdown += `    definitions: { include: { examples: true } }\n`;
      markdown += `  }\n`;
      markdown += `})\n`;
      markdown += `\`\`\`\n\n`;
    } else if (index === 1) {
      markdown += `\`\`\`typescript\n`;
      markdown += `// Prefix search for autocomplete (e.g., "hel")\n`;
      markdown += `prisma.baseWord.findMany({\n`;
      markdown += `  where: {\n`;
      markdown += `    text: { startsWith: "hel" }\n`;
      markdown += `  },\n`;
      markdown += `  include: {\n`;
      markdown += `    word: {\n`;
      markdown += `      include: {\n`;
      markdown += `        translations: { take: 5 },\n`;
      markdown += `        definitions: { take: 3 }\n`;
      markdown += `      }\n`;
      markdown += `    },\n`;
      markdown += `    languageSpecific: true\n`;
      markdown += `  },\n`;
      markdown += `  take: 20\n`;
      markdown += `})\n`;
      markdown += `\`\`\`\n\n`;
    } else if (index === 2) {
      markdown += `\`\`\`typescript\n`;
      markdown += `// Search translations by language and text\n`;
      markdown += `prisma.translation.findMany({\n`;
      markdown += `  where: {\n`;
      markdown += `    language: Language.de,\n`;
      markdown += `    text: { contains: "hallo" }\n`;
      markdown += `  },\n`;
      markdown += `  include: {\n`;
      markdown += `    word: { include: { baseWord: true } },\n`;
      markdown += `    definitions: {\n`;
      markdown += `      include: { examples: { take: 2 } },\n`;
      markdown += `      take: 3\n`;
      markdown += `    },\n`;
      markdown += `    languageSpecific: true\n`;
      markdown += `  },\n`;
      markdown += `  take: 20\n`;
      markdown += `})\n`;
      markdown += `\`\`\`\n\n`;
    }

    markdown += `---\n\n`;
  });

  markdown += `## Analysis & Recommendations\n\n`;
  markdown += `### Performance Insights\n\n`;

  const fastest = results.reduce((prev, curr) =>
    prev.avgTime < curr.avgTime ? prev : curr
  );
  const slowest = results.reduce((prev, curr) =>
    prev.avgTime > curr.avgTime ? prev : curr
  );

  markdown += `- **Fastest Query:** ${fastest.name} (${fastest.avgTime.toFixed(
    2
  )}ms avg)\n`;
  markdown += `- **Slowest Query:** ${slowest.name} (${slowest.avgTime.toFixed(
    2
  )}ms avg)\n\n`;

  markdown += `### Optimization Suggestions\n\n`;
  markdown += `1. **Indexing Strategy:**\n`;
  markdown += `   - Consider adding indexes on \`BaseWord.text\` and \`BaseWord.language\` for faster lookups\n`;
  markdown += `   - Index \`Translation.language\` and \`Translation.text\` for translation searches\n`;
  markdown += `   - Create compound indexes for frequently used query combinations\n\n`;

  markdown += `2. **Query Optimization:**\n`;
  markdown += `   - Use \`take\` and \`skip\` for pagination to limit result sets\n`;
  markdown += `   - Consider implementing cursor-based pagination for large datasets\n`;
  markdown += `   - Use \`select\` instead of \`include\` when you don't need all related data\n\n`;

  markdown += `3. **Caching Strategy:**\n`;
  markdown += `   - Implement Redis caching for frequently accessed translations\n`;
  markdown += `   - Cache popular search prefixes for autocomplete\n`;
  markdown += `   - Consider query result caching with appropriate TTL\n\n`;

  markdown += `4. **Database Optimization:**\n`;
  markdown += `   - Monitor MongoDB query execution plans\n`;
  markdown += `   - Ensure proper connection pooling is configured\n`;
  markdown += `   - Consider read replicas for high-traffic scenarios\n\n`;

  markdown += `---\n\n`;
  markdown += `*Benchmark generated by multilingual-dict benchmark suite*\n`;

  const resultsPath = path.join(__dirname, "results.md");
  await fs.writeFile(resultsPath, markdown, "utf-8");
}

// Run the benchmarks
runBenchmarks().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
