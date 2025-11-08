import prisma from "../prisma";

const getAllWordsFromDB = async () => {
  const response = await prisma.word.findMany();

  return response;
};

export const WordServices = {
  getAllWordsFromDB,
};
