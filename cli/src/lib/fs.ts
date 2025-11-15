import { glob } from "glob";
import * as path from "path";

export async function listMarkdownFilenames(cwd: string = process.cwd()): Promise<string[]> {
    // 再帰的に *.md を探す（.obsidian など除外したくなったらここでフィルタ）
    const files = await glob("**/*.md", {
        cwd,
        nodir: true,
        ignore: ["node_modules/**", ".git/**"],
    });

    // basename だけ返す（フルパスじゃなくファイル名をキーにする方針）
    const filenames = files.map((p) => path.basename(p));

    // 重複があれば一応 uniq にしておく（同名ファイルが複数ある場合は要注意だが、
    // 「同じノート=同じファイル名」で運用する前提なので、運用側で避ける）
    return Array.from(new Set(filenames));
}
