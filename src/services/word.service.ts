import prisma from "../prisma";

const getAllWordsFromDB = async () => {
  const response = await prisma.word.findMany({
    include: {
      baseWord: {
        include: {
          languageSpecific: true,
        },
      },
      definitions: {
        include: {
          examples: true,
        },
      },
      translations: {
        include: {
          definitions: {
            include: {
              examples: true,
            },
          },
          languageSpecific: true,
        },
      },
      metadata: true,
    },
  });

  return response;
};

const searchWordsInDB = async (searchTerm: string, language: string | null) => {
  const whereClause: any = {
    baseWord: {
      text: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
  };

  // Add language filter if provided
  if (language) {
    whereClause.baseWord.language = language;
  }

  const response = await prisma.word.findMany({
    where: whereClause,
    include: {
      baseWord: {
        include: {
          languageSpecific: true,
        },
      },
      definitions: {
        include: {
          examples: true,
        },
      },
      translations: {
        include: {
          definitions: {
            include: {
              examples: true,
            },
          },
          languageSpecific: true,
        },
      },
      metadata: true,
    },
  });

  return response;
};

const getWordByIdFromDB = async (wordId: string) => {
  const response = await prisma.word.findUnique({
    where: {
      id: wordId,
    },
    include: {
      baseWord: {
        include: {
          languageSpecific: true,
        },
      },
      definitions: {
        include: {
          examples: true,
        },
      },
      translations: {
        include: {
          definitions: {
            include: {
              examples: true,
            },
          },
          languageSpecific: true,
        },
      },
      metadata: true,
    },
  });

  return response;
};

const getTranslationsFromDB = async (
  wordId: string,
  targetLang: string | null
) => {
  const word = await prisma.word.findUnique({
    where: {
      id: wordId,
    },
    include: {
      baseWord: {
        include: {
          languageSpecific: true,
        },
      },
      translations: {
        where: targetLang ? { language: targetLang as any } : undefined,
        include: {
          definitions: {
            include: {
              examples: true,
            },
          },
          languageSpecific: true,
        },
      },
    },
  });

  return word;
};

export const WordServices = {
  getAllWordsFromDB,
  searchWordsInDB,
  getWordByIdFromDB,
  getTranslationsFromDB,
};
