import { stat } from "fs/promises"

export async function fileExists(path) {
    try {
        await stat(path);
        return true;
    } catch (e) {
        return false;
    }
}