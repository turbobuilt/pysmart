import { join } from "path";
import { getSystemStandardLibraryDir, getLocalStandardLibraryDir } from "./getPaths";
import { fileExists } from "./fileExists";
import { stat } from "fs/promises";
import { readdir } from "fs/promises";
import { link } from "fs/promises";
import { mkdir } from "fs/promises";
import { rm } from "fs/promises";
import { rmdir } from "fs/promises";
import { executePython } from "@/methods/executePython";
import { cp } from "fs/promises";

export async function removeDir(dir) {
    try {
        await rmdir(dir, { recursive: true });
    } catch (err) { 
    }
}

export async function removeFile(file) {
    try {
        await rm(file);
    } catch (err) { }
}

export async function recursiveHardLink(src, target, isRoot=true) {
    // if it's not a dir, hard link it, otherwise recurse
    let dirStat = await stat(src);
    if (dirStat.isDirectory()) {
        if (isRoot) {
            await removeDir(target);
        }
        await mkdir(target, { recursive: true });
        let files = await readdir(src);
        let promises = [];
        for(let file of files) {
            let filePath = join(src, file);
            let targetPath = join(target, file);
            promises.push(recursiveHardLink(filePath, targetPath, false));
        }
        await Promise.all(promises);
    } else if(dirStat.isFile()) {
        if (isRoot) {
            await removeFile(target);
        }
        try {
            await link(src, target);
        } catch (err) {
            await cp(src, target);
        }
    }
}

export async function ensurePip() {
    let result = await new Promise(async (resolve, reject) => {
        let proc = await executePython("-m ensurepip", {
            stdout: "inherit",
            stderr: "inherit",
            onExit: resolve,
        });
    });
}

export async function copyStandardLib(pythonPath) {
    let systemStandardLibraryDir = await getSystemStandardLibraryDir(pythonPath);
    let localStandardLibraryDir = await getLocalStandardLibraryDir(systemStandardLibraryDir);
    await mkdir(localStandardLibraryDir, { recursive: true });
    console.log("copying standard library", systemStandardLibraryDir, localStandardLibraryDir);
    await recursiveHardLink(systemStandardLibraryDir, localStandardLibraryDir);
}

// export async function copyPip() {
//     let systemPackagesDirs = await getSystemPythonPackagesDirs();
//     let packagesDir = await getPackagesDir();
//     // look for first pip in the system packages
//     for(let dir of systemPackagesDirs) {
//         let pipPath = join(dir, "pip");
//         let pipPathExists = await fileExists(pipPath);
//         if (pipPathExists) {
//             let destPath = join(packagesDir, "pip");
//             await recursiveHardLink(pipPath, destPath);
//         }
//     }
// }