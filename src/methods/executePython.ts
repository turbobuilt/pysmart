import { getLocalPackagesDir, getLocalPythonHome, getLocalPythonPath, getWorkingDir } from "@/lib/getPaths";
import { getYargs } from "@/lib/getYargs";
import { spawn, spawnSync } from "bun";
import { get } from "http";
import { join, normalize } from "path";

export async function executePython(cmd, { stdout="inherit", stderr="inherit", onExit }) {    
    let workingDir = await getWorkingDir();
    let pythonPackagesDir = await getLocalPackagesDir();
    let localPythonHome = await getLocalPythonHome();
    let pythonPath = await getLocalPythonPath();
    console.log("running python command:", cmd);
    console.log("python path", pythonPath,"in", workingDir, "with packages dir", pythonPackagesDir);
    let proc = spawn([pythonPath, ...cmd.split(" ")], {
        cwd: workingDir,
        env: {
            ...process.env,
            PYTHONPATH: pythonPackagesDir,
            PYTHONHOME: localPythonHome
        },
        stdout: stdout as any,
        stderr: stderr as any,
        onExit
    });
    return proc
}