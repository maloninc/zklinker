"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSearchCommand = runSearchCommand;
// cli/src/commands/search.ts
const embeddings_1 = require("../lib/embeddings");
const env_1 = require("../config/env");
async function runSearchCommand(query) {
    // 1. クエリ文字列を埋め込みに変換
    let embedding;
    try {
        embedding = await (0, embeddings_1.embedText)(query);
    }
    catch (err) {
        console.error("❌ Failed to create embedding for query:", err.message);
        process.exitCode = 1;
        return;
    }
    // 2. Supabase Edge Function /functions/v1/search を叩く
    const url = `${env_1.config.supabaseUrl}/functions/v1/search`;
    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env_1.config.supabaseServiceRoleKey}`,
            },
            body: JSON.stringify({
                embedding,
                topK: 8,
            }),
        });
    }
    catch (err) {
        console.error("❌ Failed to call search function:", err.message);
        process.exitCode = 1;
        return;
    }
    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ search API returned ${res.status}: ${text}`);
        process.exitCode = 1;
        return;
    }
    const json = (await res.json());
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
