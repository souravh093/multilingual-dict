# Multilingual Dictionary

> A comprehensive multilingual dictionary application supporting German, English, Spanish, and Italian translations with rich linguistic data.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748.svg)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Benchmarking](#-benchmarking)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

- **Multi-language Support**: German (de), English (en), Spanish (es), and Italian (it)
- **Rich Linguistic Data**:
  - Word definitions with synonyms
  - Usage examples with source attribution
  - Phonetic transcriptions
  - Grammatical information (word type, gender articles, stems)
  - Language-specific usage notes
- **Cross-language Translations**: Linked translations across all supported languages
- **Metadata Tracking**: Word frequency, entry dates, and related terms
- **Performance Optimized**: Benchmarked queries with detailed metrics
- **Type-safe**: Full TypeScript support with Prisma ORM

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

Verify your installations:

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/souravh093/multilingual-dict.git
cd multilingual-dict
```

2. **Install dependencies**

```bash
npm install
```

This will install all required packages including:

- Prisma ORM
- TypeScript
- Express.js dependencies
- Development tools

## 🔐 Environment Setup

1. **Create a `.env` file** in the root directory:

```bash
# For Windows PowerShell
New-Item .env

# For Unix/Linux/Mac
touch .env
```

2. **Add your MongoDB connection string** to `.env`:

```env
DATABASE_URL="mongodb://localhost:27017/multilingual-dict"
```

**For MongoDB Atlas (Cloud):**

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/multilingual-dict?retryWrites=true&w=majority"
```

**Important:**

- Replace `username`, `password`, and `cluster` with your actual MongoDB credentials
- Never commit the `.env` file to version control (it's already in `.gitignore`)

## 🗄️ Database Setup

Follow these steps **in order** to set up your database:

### Step 1: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema, creating type-safe database access methods.

**Expected output:**

```
✔ Generated Prisma Client to ./generated/prisma
```

### Step 2: Push Schema to Database

```bash
npm run prisma:push
```

This synchronizes your Prisma schema with your MongoDB database, creating all necessary collections.

**Expected output:**

```
🚀 Your database is now in sync with your Prisma schema
```

### Step 3: Seed the Database

```bash
npm run seed
```

This populates your database with initial word data from `mock-data/seedDataSets.json`.

**Expected output:**

```
🌱 Starting database seeding...
📊 Found X words to seed
📝 Processing word: ...
✅ Created word: ...
✨ Seeding completed successfully!
```

### Step 4 (Optional): Create Indexes

```bash
npm run create-indexes
```

This creates database indexes for optimized query performance.

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured port).

### Production Mode

1. **Build the application:**

```bash
npm run build
```

2. **Start the production server:**

```bash
npm start
```

## 📜 Available Scripts

| Script              | Command                   | Description                              |
| ------------------- | ------------------------- | ---------------------------------------- |
| **Development**     | `npm run dev`             | Start development server with hot-reload |
| **Build**           | `npm run build`           | Compile TypeScript to JavaScript         |
| **Start**           | `npm start`               | Run production server                    |
| **Prisma Generate** | `npm run prisma:generate` | Generate Prisma Client from schema       |
| **Prisma Push**     | `npm run prisma:push`     | Push schema changes to database          |
| **Seed Database**   | `npm run seed`            | Populate database with initial data      |
| **Migrate**         | `npm run migrate`         | Run database migrations                  |
| **Clean Database**  | `npm run prisma:clean`    | ⚠️ Delete all data (use with caution)    |
| **Create Indexes**  | `npm run create-indexes`  | Create database indexes for performance  |
| **Benchmark**       | `npm run bench`           | Run performance benchmarks               |

## 📁 Project Structure

```
multilingual-dict/
├── bench/                      # Benchmark suite
│   ├── queries.ts             # Benchmark query definitions
│   ├── results.md             # Latest benchmark results
│   └── README.md              # Benchmark documentation
├── generated/                  # Generated Prisma Client (auto-generated)
│   └── prisma/
├── mock-data/                  # Seed data
│   ├── seedDataSets.json      # Main seed dataset
│   └── db/                    # Language-specific data
│       ├── de.json            # German words
│       ├── en.json            # English words
│       ├── es.json            # Spanish words
│       └── it.json            # Italian words
├── prisma/                     # Prisma configuration
│   └── schema.prisma          # Database schema definition
├── scripts/                    # Utility scripts
│   ├── seed.ts                # Database seeding script
│   ├── migrate.ts             # Migration script
│   ├── clean.ts               # Database cleanup script
│   └── create-indexes.ts      # Index creation script
├── src/                        # Application source code
│   ├── index.ts               # Application entry point
│   ├── server.ts              # Server configuration
│   ├── prisma.ts              # Prisma client instance
│   ├── router.ts              # API routes
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
├── .env                        # Environment variables (create this)
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### Get Word by ID

```http
GET /api/words/:id
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "baseWord": {
      "text": "Haus",
      "language": "de",
      "article": "das",
      "phonetics": "/haʊs/",
      "wordType": "NOUN"
    },
    "translations": [...],
    "definitions": [...]
  }
}
```

#### Search Words

```http
GET /words/search?q=haus&lang=de
```

**Query Parameters:**

- `q` - Search term
- `lang` - Language code (de, en, es, it)

#### Get Translations

```http
GET /words/:id/translations?targetLang=en
```

**Query Parameters:**

- `targetLang` - Target language code

## 📊 Benchmarking

The project includes a comprehensive benchmark suite to measure query performance.

### Running Benchmarks

```bash
npm run bench
```

### Benchmark Queries

1. **Cross-language Translation Lookup** - Find English word with German translations
2. **Prefix Search** - Autocomplete functionality test
3. **Filtered Translation Search** - Search by language and text

### Results

Detailed benchmark results are automatically generated in `bench/results.md` including:

- Average, median, min, max execution times
- Standard deviation
- Individual run times
- Query optimization suggestions

For more information, see [bench/README.md](bench/README.md).

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Environment variable not found: DATABASE_URL"

**Solution:** Ensure your `.env` file exists and contains `DATABASE_URL`.

```bash
# Check if .env exists
ls -la .env  # Unix/Mac
dir .env     # Windows

# If missing, create it and add DATABASE_URL
echo "DATABASE_URL=mongodb://localhost:27017/multilingual-dict" > .env
```

#### ❌ "Cannot connect to MongoDB"

**Solutions:**

1. **Check if MongoDB is running:**

   ```bash
   # Check MongoDB service status
   sudo systemctl status mongod  # Linux
   brew services list            # Mac
   # Windows: Check Services app
   ```

2. **Start MongoDB:**

   ```bash
   sudo systemctl start mongod   # Linux
   brew services start mongodb-community  # Mac
   ```

3. **Verify connection string** in `.env` is correct

#### ❌ "Prisma Client not found"

**Solution:** Regenerate Prisma Client

```bash
npm run prisma:generate
```

#### ❌ "Module not found" errors

**Solution:** Reinstall dependencies

```bash
rm -rf node_modules package-lock.json  # Unix/Mac
# Or for Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

npm install
```

#### ❌ Seed script fails

**Solution:** Clean database and reseed

```bash
npm run prisma:clean
npm run prisma:push
npm run seed
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/souravh093/multilingual-dict/issues) page
2. Search for similar problems in closed issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, MongoDB version)

## 🔄 Complete Setup Example

Here's a complete walkthrough from clone to running:

```bash
# 1. Clone the repository
git clone https://github.com/souravh093/multilingual-dict.git
cd multilingual-dict

# 2. Install dependencies
npm install

# 3. Create .env file
echo "DATABASE_URL=mongodb://localhost:27017/multilingual-dict" > .env

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Push schema to database
npm run prisma:push

# 6. Seed the database
npm run seed

# 7. (Optional) Create indexes for performance
npm run create-indexes

# 8. Start development server
npm run dev
```

🎉 Your application should now be running on `http://localhost:3000`!

## 🧪 Testing

Run benchmarks to ensure everything is working correctly:

```bash
npm run bench
```

Expected output should show execution times for all queries without errors.

## 📝 Database Schema

The application uses the following main models:

- **Word** - Root entity containing base word and relationships
- **BaseWord** - Original word in its native language
- **Translation** - Translated versions in other languages
- **Definition** - Word definitions with synonyms
- **Example** - Usage examples with sources
- **Metadata** - Frequency and usage statistics
- **LanguageSpecific** - Language-specific usage notes

For detailed schema, see [prisma/schema.prisma](prisma/schema.prisma).

## 🔧 Development

### Adding New Languages

1. Update the `Language` enum in `prisma/schema.prisma`
2. Run `npm run prisma:generate`
3. Add language data to `mock-data/db/`
4. Update seed script if needed

### Adding New Fields

1. Update schema in `prisma/schema.prisma`
2. Run `npm run prisma:generate`
3. Run `npm run prisma:push`
4. Update seed data and TypeScript types

## 📈 Performance

- **Database**: MongoDB with optimized indexes
- **Query Times**: Average 66-77ms for complex queries (see benchmark results)
- **Type Safety**: Full TypeScript support prevents runtime errors
- **Caching**: Ready for Redis integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Sourav H**

- GitHub: [@souravh093](https://github.com/souravh093)

## 🙏 Acknowledgments

- Prisma for excellent ORM tooling
- MongoDB for flexible document storage
- TypeScript for type safety
- All contributors and users of this project

---

**Built with ❤️ using TypeScript, Prisma, and MongoDB**

For questions or support, please open an issue on GitHub.
