import { join } from "path";
import { getWorkingDir } from "./getPaths";
import { fileExists } from "./fileExists";
import { writeFile } from "fs/promises";
import { getLocalPythonVersion } from "./pythonUtils";

export async function getPackageJsonPath() {
    return join(await getWorkingDir(), "package.json");
}

export async function getPackageJson() {
    let packageJsonPath = await getPackageJsonPath();
    let exists = await fileExists(packageJsonPath);
    let packageJson = {} as any;
    if (exists) {
        packageJson = await Bun.file(packageJsonPath).json();
    }
    packageJson.dependencies = packageJson.dependencies || {};
    return packageJson;
}

export async function savePackageJson(packageJson) {
    await writeFile(await getPackageJsonPath(), JSON.stringify(packageJson, null, 4));
}

export async function getPackageLockJsonPath() {
    return join(await getWorkingDir(), "package-lock.json");
}

export async function getPackageLockJson() {
    let packageLockJsonPath = await getPackageLockJsonPath();
    let exists = await fileExists(packageLockJsonPath);
    if (!exists) {
        return {};
    }
    let packageLockJson = await Bun.file(packageLockJsonPath).json();
    return packageLockJson;
}

export async function savePackageLockJson(packageLockJson) {
    await writeFile(await getPackageLockJsonPath(), JSON.stringify(packageLockJson, null, 4));
}



export async function saveLocalPythonVersionToPackageJson() {
    console.log("Saving local python version to package.json");
    let version = await getLocalPythonVersion();
    let packageJson = await getPackageJson();
    packageJson.python = version;
    await savePackageJson(packageJson);
}