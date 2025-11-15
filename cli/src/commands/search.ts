// cli/src/commands/search.ts
import { embedText } from "../lib/embeddings";
import { config } from "../config/env";

type SearchResult = {
    filename: string;
    score: number;
};

export async function runSearchCommand(query: string) {
    // 1. クエリ文字列を埋め込みに変換
    let embedding: number[];
    try {
        embedding = await embedText(query);
    } catch (err) {
        console.error("❌ Failed to create embedding for query:", (err as Error).message);
        process.exitCode = 1;
        return;
    }

    // 2. Supabase Edge Function /functions/v1/search を叩く
    const url = `${config.supabaseUrl}/functions/v1/search`;

    let res: Response;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.supabaseServiceRoleKey}`,
            },
            body: JSON.stringify({
                embedding,
                topK: 8,
            }),
        });
    } catch (err) {
        console.error("❌ Failed to call search function:", (err as Error).message);
        process.exitCode = 1;
        return;
    }

    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ search API returned ${res.status}: ${text}`);
        process.exitCode = 1;
        return;
    }

    const json = (await res.json()) as { results?: SearchResult[] };

    const results = json.results ?? [];
    if (results.length === 0) {
        console.log("No results.");
        return;
    }

    // 3. 結果を整形表示
    results.forEach((r, idx) => {
        //const scoreStr = Number.isFinite(r.score) ? r.score.toFixed(3) : String(r.score);
        console.log(`[[${r.filename}]]`);
    });
}
