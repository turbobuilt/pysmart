import { join, normalize } from "path";
import { fileExists } from "./fileExists";
import { readdir } from "fs/promises";
import { readableStreamToText, spawn } from "bun";

const cliSelect = require('cli-select');

// matching python executables
const pythonRegex = /^python(\d+)?(\.)?(\d+)?$/;


async function getPythonPathsInDir(dir) {
    try {
        var executables = await readdir(dir);
    } catch(e) {
        return {
            root: dir,
            executables: []
        }
    }
    executables = executables.filter((executable) => {
        return pythonRegex.test(executable) ? true : false;
    })
    return {
        root: dir,
        executables: executables
    }
}

async function getPythonVersion(executable) {
    let versionInfo = new Promise(async (resolve, reject) => {
        let { stderr, stdout } = spawn([executable, "--version"], {
            stdout: "pipe",
            stderr: "pipe"
        });
        const text = (await readableStreamToText(stdout)).trim();
        resolve(text);
    });
    return versionInfo;
}

export async function getAllPythonPaths() : Promise<{path: string, version: string}[]> {
    return await new Promise(async (resolve, reject) => {
        let foundPythonPaths = [];
        let pathsToSearch = process.env.PATH.split(":");
        // remove trailing slash or backslash using os path package
        for(let i = 0; i < pathsToSearch.length; i++) {
            pathsToSearch[i] = normalize(pathsToSearch[i]).replace(/\/$/, "").replace(/\\$/, "");
        }
        // filter dupes
        pathsToSearch = Array.from(new Set(pathsToSearch));
        let promises = [];
        for (let path of pathsToSearch) {
            promises.push(getPythonPathsInDir(path));
        }

        let results = await Promise.all(promises);
        for (let result of results) {
            for (let executable of result.executables) {
                foundPythonPaths.push(join(result.root, executable));
            }
        }
        promises = [];
        // now spawn to get the version
        for (let pythonPath of foundPythonPaths) {
            promises.push(getPythonVersion(pythonPath));
        }
        let versions = await Promise.all(promises);

        for (let i = 0; i < foundPythonPaths.length; i++) {
            foundPythonPaths[i] = {
                path: foundPythonPaths[i],
                version: versions[i]
            }
        }

        if (foundPythonPaths.length > 0) {
            resolve(foundPythonPaths);
        } else {
            reject("No python or python3 found in PATH");
        }
    });
}

export async function selectPython() {
    let pythonPaths = await getAllPythonPaths();
    // show picker
    let selection = await cliSelect({
        values: pythonPaths,
        valueRenderer: (value) => {
            return value.path + " - " + value.version;
        }
    });
    return selection.value;
}