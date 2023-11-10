#!/usr/bin/env node

import { Command } from "commander";
import { fileOpsNode } from "@laoban/filesops-node";
import { GithubStore } from "./src/gitstore";
import { addAllCourseCommands, addAllEmailCommands, CommandContext } from "./src/course.and.emails.commands";
import { addLocalCommands } from "./src/local.commands";
import { addAllGitCommands } from "./src/git.commands";
import { execute } from "./src/execute";


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
  .option ( '-f|--emailfile <emailfile>', "emails.csv" )
  .option ( '-e|--email <emails...>' )
  .option ( '-c|--course <coursefile>', "course.json" )
  .version ( findVersion () )


const fileOps = fileOpsNode ()


const gitstore = GithubStore ( fetch, execute )
const context: CommandContext = { command: program, fileOps, gitstore }

addAllCourseCommands ( context )
addAllEmailCommands ( context )
addAllGitCommands ( context )
addLocalCommands ( context )
context.command.command ( "debug" ).description ( "just lists the flags you selected" ).action ( () => {
  console.log ( context.command.optsWithGlobals () )
} )

const parsed = program.parseAsync ( process.argv );
