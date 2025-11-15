import { listMarkdownFilenames } from "../lib/fs";
import { embedText } from "../lib/embeddings";
import { upsertNoteEmbedding } from "../lib/api";

export async function runIndexCommand() {
    console.log("zklinker index: indexing markdown files in current directory...");

    const filenames = await listMarkdownFilenames();
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
            const embedding = await embedText(filename);
            await upsertNoteEmbedding(filename, embedding);
            successCount++;
            console.log(`✅ Indexed: ${filename}`);
        } catch (err) {
            failureCount++;
            console.error(`❌ Failed to index ${filename}:`, (err as Error).message);
        }
    }

    console.log("");
    console.log(`Indexing finished. Success: ${successCount}, Failed: ${failureCount}`);
}
