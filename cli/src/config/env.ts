import * as dotenv from "dotenv";

dotenv.config({ quiet: true }); // silence dotenv banner in CLI output

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set`);
    }
    return value;
}

export const config = {
    openaiApiKey: requireEnv("ZKL_OPENAI_API_KEY"),
    supabaseUrl: requireEnv("ZKL_SUPABASE_URL"),
    supabaseServiceRoleKey: requireEnv("ZKL_SUPABASE_SERVICE_ROLE_KEY"),
};
