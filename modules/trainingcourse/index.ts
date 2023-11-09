#!/usr/bin/env node

import { Command } from "commander";
import { fileOpsNode } from "@laoban/filesops-node";
import { ExecuteFn, GithubStore } from "./src/gitstore";
import { addAllCourseCommands, addAllEmailCommands, CommandContext } from "./src/course.and.emails.commands";
import { addLocalCommands } from "./src/local.commands";
import { execFile } from 'child_process';
import { promisify } from 'util';
import { addAllGitCommands } from "./src/git.commands";

const execFileAsync = promisify ( execFile );
export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}


const program: Command = require ( 'commander' )
  .name ( 'gittraining' )
  .usage ( '<command> [options]' )
  .option ( '--load.laoban.debug' ).version ( findVersion () )

const fileOps = fileOpsNode ()

const execute: ExecuteFn = async ( command, args ) => {
  try {
    const { stdout, stderr } = await execFileAsync ( command, args );
    // If the command executes successfully, the exit code is 0
    return { stdout, stderr, code: 0 };
  } catch ( error: any ) {
    // If there is an error, capture the error message, and the exit code
    return { stdout: '', stderr: error.message, code: error.code };
  }
};
const gitstore = GithubStore ( fetch, execute )
const context: CommandContext = { command: program, fileOps, gitstore }

addAllCourseCommands ( context )
addAllEmailCommands ( context )
addAllGitCommands ( context )
addLocalCommands ( context )

const parsed = program.parseAsync ( process.argv );
