"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertNoteEmbedding = upsertNoteEmbedding;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const supabase = (0, supabase_js_1.createClient)(env_1.config.supabaseUrl, env_1.config.supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
    },
});
// embedding は number[] として受け取る
async function upsertNoteEmbedding(filename, embedding) {
    const { error } = await supabase
        .from("notes")
        .upsert({
        filename,
        embedding,
        updated_at: new Date().toISOString(),
    }, {
        onConflict: "filename",
    });
    if (error) {
        throw new Error(`Failed to upsert note embedding for ${filename}: ${error.message}`);
    }
}
