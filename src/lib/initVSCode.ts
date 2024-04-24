import { join } from "path";
import { getWorkingDir } from "./getPaths";
import { mkdir } from "fs/promises";
import { fileExists } from "./fileExists";
import { readFile } from "fs/promises";
import pylanceJson from "../static/pylance.json";
import { writeFile } from "fs/promises";

export async function initVSCode() {
    let workingDir = getWorkingDir();
    // check for .vscode
    let vscodeConfigDir = join(workingDir, ".vscode");
    await mkdir(vscodeConfigDir, { recursive: true });
    let vsCodeSettings = {};
    let settingsJsonPath = join(vscodeConfigDir, "settings.json");
    if (await fileExists(settingsJsonPath)) {
        vsCodeSettings = await Bun.file(settingsJsonPath).json();
    }
    for (let key in pylanceJson) {
        if (!vsCodeSettings[key]) {
            vsCodeSettings[key] = pylanceJson[key];
        } else {
            // if it's a string, overwrite it.
            // if it's an object, merge it.
            // untested
            if (typeof pylanceJson[key] === "string") {
                vsCodeSettings[key] = pylanceJson[key];
            } else if (Array.isArray(pylanceJson[key])) {
                vsCodeSettings[key] = pylanceJson[key];
            } else {
                vsCodeSettings[key] = {
                    ...vsCodeSettings[key],
                    ...pylanceJson[key]
                };
            }
        }
    }
    await writeFile(settingsJsonPath, JSON.stringify(vsCodeSettings, null, 4));
}