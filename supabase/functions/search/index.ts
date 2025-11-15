// supabase/functions/search/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
});

// 型を正規化するヘルパー
function normalizeEmbedding(value: unknown): number[] {
    if (Array.isArray(value)) {
        // ["0.1", 0.2, ...] みたいなのも全部 Number(...) で数値化
        return value.map((v) => Number(v ?? 0));
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((v) => Number(v ?? 0));
            }
        } catch {
            // パース失敗したら空ベクトル扱い
            return [];
        }
    }

    // null / undefined / その他の型は空ベクトル扱い
    return [];
}

// コサイン類似度の計算
function cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0;
    let na = 0;
    let nb = 0;

    for (let i = 0; i < len; i++) {
        const x = a[i] ?? 0;
        const y = b[i] ?? 0;
        dot += x * y;
        na += x * x;
        nb += y * y;
    }

    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

serve(async (req: Request) => {
    // メソッドチェック
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Only POST allowed" }),
            { status: 405, headers: { "Content-Type": "application/json" } },
        );
    }

    // リクエストボディ解析
    const body = await req.json().catch(() => null);
    const embedding = body?.embedding as number[] | undefined;
    const topKRaw = body?.topK;
    const topK = typeof topKRaw === "number" && topKRaw > 0 ? topKRaw : 3;

    if (!embedding || !Array.isArray(embedding)) {
        return new Response(
            JSON.stringify({ error: "embedding (number[]) is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    // notes テーブルの全レコードを取得
    const { data, error } = await supabase
        .from("notes")
        .select("filename, embedding");

    if (error) {
        console.error("Supabase error:", error);
        return new Response(
            JSON.stringify({ error: "failed to query notes" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }

    const rows = (data ?? []) as { filename: string; embedding: number[] }[];

    // 類似度計算 & 上位 topK を返却
    const scored = rows
        .map((row) => ({
            filename: row.filename,
            score: cosineSimilarity(embedding, normalizeEmbedding(row.embedding)),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    return new Response(
        JSON.stringify({ results: scored }),
        { status: 200, headers: { "Content-Type": "application/json" } },
    );
});
