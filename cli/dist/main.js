"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// cli/src/main.ts
const commander_1 = require("commander");
const index_1 = require("./commands/index");
const search_1 = require("./commands/search");
const program = new commander_1.Command();
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
        await (0, index_1.runIndexCommand)();
    }
    catch (err) {
        console.error("zklinker index failed:", err.message);
        process.exitCode = 1;
    }
});
// search
program
    .command("search")
    .argument("<text>", "query text")
    .description("Search similar notes by semantic similarity")
    .action(async (text) => {
    try {
        await (0, search_1.runSearchCommand)(text);
    }
    catch (err) {
        console.error("zklinker search failed:", err.message);
        process.exitCode = 1;
    }
});
program.parse(process.argv);
