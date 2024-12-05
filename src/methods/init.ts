import { fileExists } from "@/lib/fileExists";
import { getLocalPackagesDir, getLocalPythonHome, getLocalPythonPath, getWorkingDir } from "@/lib/getPaths";
import { initGit } from "@/lib/git";
import { selectPython } from "@/lib/initPython";
import { initVSCode } from "@/lib/initVSCode";
import { getPackageJson, getPackageJsonPath, saveLocalPythonVersionToPackageJson, savePackageJson } from "@/lib/packageUtils";
import { copyStandardLib, ensurePip, removeFile } from "@/lib/pipUtils";
import { cp } from "fs/promises";
import { symlink } from "fs/promises";
import { rm } from "fs/promises";
import { link } from "fs/promises";
import { mkdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { stat } from "fs/promises";
import { dirname, join } from "path";


export async function init(argv) {
    let workingDir = getWorkingDir();
    // look for package json, if it exists exit, otherwise create it
    console.log("Init command executed in:", workingDir);

    let packageJson = await getPackageJson();
    packageJson.name = argv.name || packageJson.name || "";
    await savePackageJson(packageJson);

    // get best python
    let pythonPathInfo = await selectPython();
    packageJson.pythonExecutable = pythonPathInfo.path;
    await savePackageJson(packageJson);

    let pythonPackagesDir = await getLocalPackagesDir();
    await mkdir(pythonPackagesDir, { recursive: true });

    // let pythonHome = await getLocalPythonHome();
    // await mkdir(pythonHome, { recursive: true });

    // let pythonPath = await getLocalPythonPath();
    // await mkdir(dirname(pythonPath), { recursive: true });
    // console.log("removing python", pythonPath);
    // await removeFile(pythonPath);


    // console.log("linking python", pythonPathInfo.path, pythonPath);
    // symlink it
    // await symlink(pythonPathInfo.path, pythonPath);
    // try {
    //  await link(pythonPathInfo.path, pythonPath);
    // } catch (err) {
    //     console.error("error hard linking will copy python executable");
    //     await cp(pythonPathInfo.path, pythonPath);
    // }
    
    // await copyStandardLib(pythonPathInfo.path);
    await ensurePip();
    await initGit();
    await saveLocalPythonVersionToPackageJson();
    await initVSCode();
}