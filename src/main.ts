
import { init } from "./methods/init";
import { executePython } from "./methods/executePython";
import { getYargs } from "./lib/getYargs";
import { installPackages } from "./methods/install";

let argv = getYargs();
let cmd = argv._[0];
console.log(argv);
if (cmd === "init") {
    init(argv);
} else if (cmd === "i" || cmd === "install") {
    installPackages(argv);
} else {
    let script = argv._[0];
    let scriptIndex = process.argv.indexOf(script);
    let cmd = process.argv.slice(scriptIndex).join(" ")
    executePython(cmd, { stderr: "inherit", stdout: "inherit", onExit: () => { } });
}