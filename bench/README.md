# Benchmark Suite Documentation

## Overview

This benchmark suite measures the performance of critical database queries in the multilingual dictionary application. It helps identify performance bottlenecks and optimization opportunities.

## Running the Benchmarks

To run the benchmark suite:

```bash
npm run bench
```

## Benchmark Queries

### 1. Find English Base Word + German Translation

**Purpose:** Tests cross-language translation lookup  
**Use Case:** User searches for an English word and needs German translations  
**Complexity:** High - involves nested relations and filtered includes

### 2. Prefix Search on baseWord.text

**Purpose:** Tests partial text matching for autocomplete  
**Use Case:** User types "hel" and expects suggestions like "hello", "help", "helicopter"  
**Complexity:** Medium - simple prefix match with related data

### 3. Search Translations by Language + Text

**Purpose:** Tests filtered translation search  
**Use Case:** User searches for German words containing "hallo"  
**Complexity:** Medium - filtered search with nested includes

## Configuration

- **Warmup Runs:** 3 (not counted in results)
- **Measurement Runs:** 10 (averaged for final results)
- **Cooldown Time:** 100ms between runs

## Output

Results are automatically saved to `bench/results.md` with:

- Summary table with key metrics
- Detailed results for each benchmark
- Individual run times
- Query code examples
- Performance analysis and optimization recommendations

## Key Metrics

- **Average Time:** Mean execution time across all runs
- **Median Time:** Middle value of all runs (less affected by outliers)
- **Min Time:** Fastest execution time
- **Max Time:** Slowest execution time
- **Standard Deviation:** Measure of consistency/variance

## Adding New Benchmarks

1. Create a new benchmark function following the naming pattern:

   ```typescript
   async function benchmarkN_YourBenchmarkName() {
     // Your query here
     return result;
   }
   ```

2. Add the benchmark to `runBenchmarks()`:

   ```typescript
   const benchN = await measureQueryTime(
     benchmarkN_YourBenchmarkName,
     "Display Name"
   );
   ```

3. Add documentation in `writeResultsToMarkdown()` for the new query

## Performance Tips

- Run benchmarks on a warmed-up database
- Ensure consistent system load during benchmarking
- Run multiple times and compare results
- Use the standard deviation to assess consistency

## Latest Results

Check `results.md` for the most recent benchmark results with detailed analysis.
