import { selectPython } from "@/lib/initPython";
import { readableStreamToText, spawnSync } from "bun";
import { executePython } from "./executePython";
import { getLocalPackagesDir, getLocalPythonPath } from "@/lib/getPaths";
import { getPackageJson, getPackageLockJson, savePackageJson, savePackageLockJson } from "@/lib/packageUtils";

export async function installPackages(argv) {
    let newPackages = argv.packages;
    if (newPackages?.length > 0) {
        await addNewPackages(argv.packages);
    } else {
        await restorePackages();
    }
}

export async function addNewPackages(newPackages) {
    console.log("Installing new packages", newPackages);
    let packagesDirectory = await getLocalPackagesDir();
    await new Promise(async (resolve) => {
        await executePython(["-m", "pip", "install", `--target=${packagesDirectory}`, newPackages.join(" ")], {
            stdout: "inherit",
            stderr: "inherit",
            onExit: resolve,
        });
    });
    // now run pip freeze
    console.log("Running pip freeze");
    await new Promise(async resolve => {
        let { stdout } = await executePython(["-m", "pip", "freeze", ">"], { onExit: resolve, stdout: "pipe" })
        let result = await readableStreamToText(stdout);
        // save to package-lock.json
        let lines = result.trim().split(/\r?\n/);
        let packageLock = {
            dependencies: {}
        };
        let packageJson = await getPackageJson();
        for (let line of lines) {
            let parts = line.split("==");
            packageLock.dependencies[parts[0]] = {
                version: parts[1]
            }
            packageJson.dependencies[parts[0]] = "^" + parts[1];
        }
        await savePackageLockJson(packageLock);
        await savePackageJson(packageJson);
    });
    console.log("Installed new packages", newPackages);
}

const semverRegex = /^\^\d+\.\d+\.\d+$/;
const semVer2Regex = /^\d+\.\d+$/;
const semVer1Regex = /^\d+$/;
export function convertPackageJsonVersionToPython(version){
    // convert ^x.x.x to >=x.x.x,<x.x.x
    if (semverRegex.test(version)) {
        let parts = version.slice(1).split(".");
        let major = parseInt(parts[0]);
        let minor = parseInt(parts[1]);
        let patch = parseInt(parts[2]);
        return `>=${major}.${minor}.${patch},<${major+1}.0.0`;
    } else if (semVer2Regex.test(version)) {
        let parts = version.split(".");
        let major = parseInt(parts[0]);
        let minor = parseInt(parts[1]);
        return `>=${major}.${minor}.0,<${major}.${minor+1}.0`;
    } else if (semVer1Regex.test(version)) {
        let major = parseInt(version);
        return `>=${major}.0.0,<${major+1}.0.0`;
    }
    return version;
}

export async function restorePackages() {
    let packageJson = await getPackageJson();
    let packageLock = await getPackageLockJson();
    let packagesString = "";

    // first add package json ones
    let packageData = {}
    for (let key in packageJson.dependencies) {
        packageData[key] = `${convertPackageJsonVersionToPython(packageJson.dependencies[key])}`;
    }
    // now add package lock ones to overwrite with separate versions
    for (let key in packageLock.dependencies) {
        packageData[key] = `==${packageLock.dependencies[key]["version"]}`;
    }
    for (let key in packageData) {
        packagesString += `${key}${packageData[key]} `;
    }


    // install all dependencies
    await new Promise(async (resolve) => {
        let localPackagesDir = await getLocalPackagesDir();
        await executePython(`-m pip install -t ${localPackagesDir} ` + packagesString, {
            stdout: "inherit",
            stderr: "inherit",
            onExit: resolve,
        });
    });
}