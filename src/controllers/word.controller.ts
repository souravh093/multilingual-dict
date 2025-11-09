import http from "http";
import { WordServices } from "../services/word.service";
import { internalServerError, ok, badRequest } from "../utils/response";

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

const searchWords = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const searchTerm = url.searchParams.get("q");
    const language = url.searchParams.get("lang");

    if (!searchTerm) {
      return badRequest(res, "Query parameter 'q' is required");
    }

    const response = await WordServices.searchWordsInDB(searchTerm, language);

    return ok(res, response);
  } catch (error) {
    console.log(error);
    return internalServerError(res);
  }
};

const getWordById = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  wordId: string
) => {
  try {
    const response = await WordServices.getWordByIdFromDB(wordId);

    if (!response) {
      return badRequest(res, "Word not found");
    }

    return ok(res, response);
  } catch (error) {
    console.log(error);
    return internalServerError(res);
  }
};

const getTranslations = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  wordId: string
) => {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const targetLang = url.searchParams.get("targetLang");

    const response = await WordServices.getTranslationsFromDB(
      wordId,
      targetLang
    );

    if (!response) {
      return badRequest(res, "Word not found");
    }

    return ok(res, response);
  } catch (error) {
    console.log(error);
    return internalServerError(res);
  }
};

export const WordsController = {
  getAllWords,
  searchWords,
  getWordById,
  getTranslations,
};
