import { readableStreamToText } from "bun";
import { getLocalPythonPath } from "./getPaths";

export async function getLocalPythonVersion() {
    let localPythonPath = await getLocalPythonPath();
    console.log("Getting python version from", localPythonPath);
    let proc = await Bun.spawn([localPythonPath, "--version"], {
        stdout: "pipe",
        stderr: "pipe"
    });
    let version = await readableStreamToText(proc.stdout);
    console.log("Python Version:", version);
    return version.trim().match(/Python (\d+\.\d+\.\d+)/)[1];
}