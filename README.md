# What is this?
zklinker is a lightweight CLI that helps you discover links inside a Zettelkasten-style note archive. Embeddings and similarity search are backed by Supabase (PostgreSQL + edge functions), so the CLI remains simple while Supabase handles persistence and compute.
`zklinker index` builds an index of your notes, and `zklinker search <text>` finds notes similar to `<text>` so you can surface related ideas quickly.

# Installation

## Requirements
- Node.js 20+ and npm (needed to build and install the CLI)
- A Supabase project or local Supabase stack (the CLI reads/writes embeddings via Supabase and calls the `search` edge function)
- An OpenAI API key (used to create embeddings)

1. Clone the repository locally
   ```bash
   git clone https://github.com/maloninc/zklinker.git
   cd zklinker/cli
   ```
2. Install dependencies and build the CLI bundle:
   ```bash
   npm install
   npm run build
   ```
3. Install the CLI.
   ```bash
   npm install -g .
   ```
4. Deploy your supabase project
    ```bash
    cd ../supabase
    brew install supabase/tap/supabase
    supabase login
    supabase link --project-ref <your-project-id>
    supabase db push
    supabase functions deploy search
    ```
5. Set the following environment variables so the CLI can talk to your Supabase project and OpenAI:
    ```
    ZKL_OPENAI_API_KEY=your-openai-api-key
    ZKL_SUPABASE_URL=your-supabase-project-url
    ZKL_SUPABASE_SERVICE_ROLE_KEY=your-supabase-jwt
    ```
6. Build index for your notes.
   ```bash
   cd <directory of your notes>
   zklinker --help
   ```

> Development tip: if you prefer a live-development workflow, run `npm link` instead of step 3; npm will create a symlink so you can edit the source and immediately use `zklinker`.

# Development
zklinker expects a Supabase project (local or hosted) where it can store embeddings and run the `search` edge function under `supabase/functions/search`. The steps below show the local Supabase workflow bundled with this repo.

## 1. Create `.env`
```
ZKL_OPENAI_API_KEY=your-openai-api-key
ZKL_SUPABASE_URL=http://localhost:54321
ZKL_SUPABASE_SERVICE_ROLE_KEY=supabase-jwt
```

## 2. Launch Supabase locally
```bash
cd supabase
supabase start
supabase functions serve search --no-verify-jwt --env-file supabase/.env
```

## 3. Index your notes
```bash
cd /path/to/your/markdown/docs
set -a; source /path/to/zklinker/supabase/.env ; set +a
zklinker index
```

## 4. Deploy (optional)
```bash
supabase login
supabase link --project-ref <your-project-id>
supabase db push
supabase functions deploy search
```
