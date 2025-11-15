"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIndexCommand = runIndexCommand;
const fs_1 = require("../lib/fs");
const embeddings_1 = require("../lib/embeddings");
const api_1 = require("../lib/api");
async function runIndexCommand() {
    console.log("zklinker index: indexing markdown files in current directory...");
    const filenames = await (0, fs_1.listMarkdownFilenames)();
    if (filenames.length === 0) {
        console.log("No markdown files found. Nothing to index.");
        return;
    }
    console.log(`Found ${filenames.length} markdown files.`);
    let successCount = 0;
    let failureCount = 0;
    for (const filename of filenames) {
        try {
            // 今回は「ファイル名そのもの」を埋め込む
            const embedding = await (0, embeddings_1.embedText)(filename);
            await (0, api_1.upsertNoteEmbedding)(filename, embedding);
            successCount++;
            console.log(`✅ Indexed: ${filename}`);
        }
        catch (err) {
            failureCount++;
            console.error(`❌ Failed to index ${filename}:`, err.message);
        }
    }
    console.log("");
    console.log(`Indexing finished. Success: ${successCount}, Failed: ${failureCount}`);
}
