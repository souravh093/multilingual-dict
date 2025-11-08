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

export const WordServices = {
  getAllWordsFromDB,
};
