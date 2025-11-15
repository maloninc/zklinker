create extension if not exists vector;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  filename text not null unique,      -- ファイル名 = ノートの識別子
  embedding vector(1536),             -- 埋め込み（モデル次元数に合わせる）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS を明示的に無効化
alter table public.notes disable row level security;

create index if not exists notes_embedding_ivfflat_idx
  on public.notes
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
