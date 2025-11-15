import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env";

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
    },
});

// embedding は number[] として受け取る
export async function upsertNoteEmbedding(filename: string, embedding: number[]): Promise<void> {
    const { error } = await supabase
        .from("notes")
        .upsert(
            {
                filename,
                embedding,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: "filename",
            },
        );

    if (error) {
        throw new Error(`Failed to upsert note embedding for ${filename}: ${error.message}`);
    }
}
