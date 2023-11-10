import { ExecuteFn } from "./gitstore";
import { promisify } from "util";
import { exec, execFile } from "child_process";

const execAsync = promisify(exec);
export const execute: ExecuteFn = async ( command ) => {
  try {
    const { stdout, stderr } = await execAsync ( command );
    // If the command executes successfully, the exit code is 0
    return { stdout, stderr, code: 0 };
  } catch ( error: any ) {
    // If there is an error, capture the error message, and the exit code
    return { stdout: '', stderr: error.message, code: error.code };
  }
};