import http from "http";
import { WordServices } from "../services/word.service";
import { internalServerError, ok } from "../utils/response";

const getAllWords = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  try {
    const response = await WordServices.getAllWordsFromDB();

    return ok(res, response);
  } catch (error) {
    console.log(error);
    return internalServerError(res);
  }
};

export const WordsController = {
  getAllWords,
};
