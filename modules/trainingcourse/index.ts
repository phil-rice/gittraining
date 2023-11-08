#!/usr/bin/env node

import { Command } from "commander";
import { loadAndConvertCourse, RawCourse } from "./src/course";
import { fileOpsNode } from "@laoban/filesops-node";
import * as Console from "console";
import { GithubStore } from "./src/gitstore";

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
const courseCommands: Command = program.command ( 'course' ).description ( 'commands to manipulate course details' )


courseCommands.command ( 'list' ).description ( 'lists the details of the course' ).action (
  async () => {
    try {
      const course = await loadAndConvertCourse ( fileOps, "course.txt" )
      console.log ( "course", JSON.stringify ( course ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  }
)

async function createCourseFile ( force?: boolean ) {
  const exists = await fileOps.isFile ( "course.txt" )
  if ( exists && !force ) throw new Error ( "course.txt already exists. Use --force to override" )
  console.log ( "creating course.txt" )
  let course: RawCourse = {
    title: "Untitled",
    emailFile: "emails.txt",
    rootOwner: "phil-rice",
    "rootRepo": "javaoptics",
    "organisation": "https://github.com/training-demo-for-phil"
  };
  return fileOps.saveFile ( "course.txt",
    JSON.stringify ( course, null, 2 ) )
}
async function createEmailsFile ( force?: boolean ) {
  const exists = await fileOps.isFile ( "emails.txt" )
  if ( exists && !force ) throw new Error ( "emails.txt already exists. Use --force to override" )
  console.log ( "creating emails.txt" )
  return fileOps.saveFile ( "emails.txt", "" )
}
courseCommands.command ( 'init' ).description ( 'Creates a blank course file' ).option ( '-f, --force', 'force overwrite' ).action (
  async ( opts ) => {
    const force = opts?.force
    try {
      await createCourseFile ( force );
      await createEmailsFile ( force );
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  }
)


const emailCommands: Command = program.command ( 'emails' ).description ( 'commands to manipulate emails' )
emailCommands.command ( 'init' ).description ( 'creates a blank emails file' ).option ( '-f, --force', 'force overwrite' ).action (
  async ( opts ) => {
    try {
      await createEmailsFile ( opts?.force );
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  }
)
async function loadEmails () {
  const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
  const emails = course.emails
  return emails;
}
emailCommands.command ( 'list' ).description ( 'lists the emails' ).action ( async () => {
  try {
    const emails = await loadEmails ();
    emails.forEach ( e => console.log ( e ) )
  } catch ( e ) {
    console.log ( "error", e.message )
  }
} )
emailCommands.command ( 'add <email>' ).description ( 'adds the email' ).action ( async ( email, opts ) => {
  try {
    const emails = (await loadEmails ()).map ( e => e.email )
    if ( !emails.includes ( email ) )
      emails.push ( email );
    await fileOps.saveFile ( "emails.txt", emails.filter ( s => s.length > 0 ).join ( "\n" ) )
  } catch ( e ) {
    console.log ( "error", e.message )
  }
} )
emailCommands.command ( 'remove <email>' ).description ( 'removes the email' ).action ( async ( email, opts ) => {
  try {
    const emails = (await loadEmails ()).map ( e => e.email )
    await fileOps.saveFile ( "emails.txt", emails.filter ( s => s !== email ).filter ( s => s.length > 0 ).join ( "\n" ) )
  } catch ( e ) {
    console.log ( "error", e.message )
  }
} )

const gitCommands: Command = program.command ( 'git' ).description ( 'commands to create and report on git repos for the students taking the course' )

gitCommands.command ( 'status' ).description ( 'finds the status of the git repos for the students in the email list' ).action ( async ( email, opts ) => {
  try {
    const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
    const emails = course.emails;
    emails.forEach ( e => Console.log ( `${e.repo}` ) )
  } catch ( e ) {
    console.log ( "error", e.message )
  }
} )
gitCommands.command ( 'listforks' ).description ( 'A debug capability: lists all the forks of the original repo' ).action ( async ( email, opts ) => {
  try {
    const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
    const gitstore = GithubStore ( fetch )
    const forks = await gitstore.listforks ( course.rootOwner, course.rootRepo )
    Console.log ( JSON.stringify ( forks ) )

  } catch ( e ) {
    console.log ( "error", e.message )
  }
} )


const parsed = program.parseAsync ( process.argv );
