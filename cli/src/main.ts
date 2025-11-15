// cli/src/main.ts
import { Command } from "commander";
import { config } from "./config/env"; // env読み込み
import { runIndexCommand } from "./commands/index";
import { runSearchCommand } from "./commands/search";

const program = new Command();

program
    .name("zklinker")
    .description("Zettelkasten semantic linker CLI")
    .version("0.1.0");

// index
program
    .command("index")
    .description("Index markdown notes in the current directory")
    .action(async () => {
        try {
            await runIndexCommand();
        } catch (err) {
            console.error("zklinker index failed:", (err as Error).message);
            process.exitCode = 1;
        }
    });

// search
program
    .command("search")
    .argument("<text>", "query text")
    .description("Search similar notes by semantic similarity")
    .action(async (text: string) => {
        try {
            await runSearchCommand(text);
        } catch (err) {
            console.error("zklinker search failed:", (err as Error).message);
            process.exitCode = 1;
        }
    });

program.parse(process.argv);
