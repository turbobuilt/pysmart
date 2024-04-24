import yargs from "yargs";
import { hideBin } from "yargs/helpers"

export function getYargs() {
    let result = yargs(hideBin(process.argv))
        .command("init", "Initialize a new python package", function (yargs) {
            return yargs.option('dir', {
                alias: 'd',
                default: process.cwd()
            })
        })
        .command(["i [packages..]","install"], "Install a python package or restore packages", function (yargs) {
            return yargs.option('dir', {
                alias: 'd',
                default: process.cwd()
            })
        })
        .scriptName("pys").parse()
    return result;
}