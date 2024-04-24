import { writeFile } from "fs/promises";
import { getWorkingDir } from "./getPaths";
import { fileExists } from "./fileExists";


export async function initGit() {
    let workingDir = await getWorkingDir();
    let gitignoreExists = await fileExists(workingDir + "/.gitignore");
    if (!gitignoreExists) {
        await writeFile(workingDir + "/.gitignore", ["python_packages", "python"].join("\n"));
    }
}