
import { init } from "./methods/init";
import { executePython } from "./methods/executePython";
import { getYargs } from "./lib/getYargs";
import { installPackages } from "./methods/install";
import { hideBin } from "yargs/helpers"

let argv = getYargs();
let cmd = argv._[0];
console.log(argv);
if (cmd === "init") {
    init(argv);
} else if (cmd === "i" || cmd === "install") {
    installPackages(argv);
} else {
    let script = argv._[0];
    let cmd = hideBin(process.argv);
    if(!cmd.length) {
        console.error("No python script provided. Try 'spy init' to setup a new project, or 'spy --help' for more options");
        // print yargs help
        process.exit(1);
    }
    executePython(cmd, { stderr: "inherit", stdout: "inherit", onExit: () => { } });
}