import { getDyldLibraryPath, getLocalPackagesDir, getLocalPythonHome, getLocalPythonPath, getPythonHome, getSitePackagesDir, getWorkingDir } from "@/lib/getPaths";
import { getYargs } from "@/lib/getYargs";
import { spawn, spawnSync } from "bun";
import { get } from "http";
import { join, normalize } from "path";

export async function executePython(cmd: string[], { stdout="inherit", stderr="inherit", onExit }) {    
    let workingDir = await getWorkingDir();
    let pythonPackagesDir = await getLocalPackagesDir();
    let pythonSitePackagesDir = await getSitePackagesDir();
    let localPythonHome = await getLocalPythonHome();
    let pythonPath = await getLocalPythonPath();
    let dyldLibraryPath = await getDyldLibraryPath();
    console.log("running python command:", cmd);
    let proc = spawn([pythonPath, "-S", ...cmd], {
        cwd: workingDir,
        env: {
            ...process.env,
            PYTHONPATH: pythonPackagesDir,
            // PYTHONHOME: "/Users/dev/prg/smartpy/test/python",
            PYTHONNOUSERSITE: "1",
            // PYTHONUSERBASE: await getPythonHome(),
            // PYTHONHOME: localPythonHome,
            DYLD_LIBRARY_PATH: dyldLibraryPath
        },
        stdout: stdout as any,
        stderr: stderr as any,
        onExit
    });
    return proc
}