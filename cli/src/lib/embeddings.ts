import OpenAI from "openai";
import { config } from "../config/env";

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embedText(text: string): Promise<number[]> {
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
