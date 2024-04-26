import { basename, join, resolve } from "path";
import { fileExists } from "./fileExists";
import { selectPython } from "./initPython";
import { getYargs } from "./getYargs";
import { readableStreamToText, spawn } from "bun";
import { getPackageJson } from "./packageUtils";

export function getWorkingDir() {
    let args = getYargs();
    let dir = args["dir"] || process.cwd();
    return resolve(dir);
}

export async function getSitePackagesDir() {
    return "/Users/dev/prg/smartpy/test/python/Library/Python/3.9/site-packages";
}
export async function getLocalPackagesDir() {
    let workingDir = getWorkingDir();
    return resolve(workingDir, "python_packages");
}
export async function getPythonHome() {
    let workingDir = getWorkingDir();
    return resolve(workingDir, "python");
}

export async function getLocalPythonHome() {
    let workingDir = getWorkingDir();
    return resolve(workingDir, "python");
}

export async function getLocalPythonPath() {
    let packageJson = await getPackageJson();
    let pythonPath = packageJson.pythonExecutable;
    if (!pythonPath) {
        throw new Error("pythonExecutable not found in package.json.  Please run spy init to choose your python, or put the path to your selected python in the pythonExecutable field of your package.json.");
    }
    return pythonPath;
    // let pythonHome = await getLocalPythonHome();
    // let expectedPath = join(pythonHome, "/python");
    // return expectedPath;
}

export async function getDyldLibraryPath() {
    let pythonHome = await getLocalPythonHome();
    return join(pythonHome);
}

export async function getSystemPythonPackagesDirs() {
    let pythonPath = await getLocalPythonPath();
    console.log("Python Path:", pythonPath);
    let { stdout } = await spawn([pythonPath, "-c", "import site; print(site.getsitepackages())"]);
    const text = await readableStreamToText(stdout);
    console.log("Python Packages Dir:", text);
    let dirs = text.trim().slice(1, -1).split(",");
    for(let i = 0; i < dirs.length; i++) {
        dirs[i] = dirs[i].trim().slice(1, -1);
    }
    return dirs;
}

export async function getSystemStandardLibraryDir(pythonPath) {
    // python3 -c "import sysconfig; print(sysconfig.get_paths()['stdlib'])"
    let { stdout } = await spawn([pythonPath, "-c", "import sysconfig; print(sysconfig.get_paths()['stdlib'])"]);
    // let { stdout } = await spawn([pythonPath, "-c", "import sys; print(sys.prefix)"]);
    const text = await readableStreamToText(stdout);
    return text.trim();
}

export async function getLocalStandardLibraryDir(remotePath) {
    let pythonHome = await getLocalPythonHome();
    let lastPath = basename(remotePath);
    return join(pythonHome, `lib/${lastPath}`);
}