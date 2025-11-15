"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedText = embedText;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const openai = new openai_1.default({
    apiKey: env_1.config.openaiApiKey,
});
const EMBEDDING_MODEL = "text-embedding-3-small";
async function embedText(text) {
    const res = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
    });
    const embedding = res.data[0]?.embedding;
    if (!embedding) {
        throw new Error("Failed to get embedding from OpenAI response");
    }
    return embedding;
}
