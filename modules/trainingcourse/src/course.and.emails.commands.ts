import { loadAndConvertCourse, RawCourse } from "./course";
import { Command } from "commander";
import { FileOps } from "@laoban/fileops";
import { Gitstore } from "./gitstore";

export const courseFileName = "course.json"
export const emailsFileName = "emails.csv"

export function addAllCourseCommands ( context: CommandContext ) {
  const courseCommands: Command = context.command.command ( 'course' ).description ( 'commands to manipulate course details' )
  const newCourseCommands: CommandContext = { ...context, command: courseCommands }
  addInitCourseCommand ( newCourseCommands )
  addListCommand ( newCourseCommands )
}
export function addAllEmailCommands ( context: CommandContext ) {
  const emailCommands: Command = context.command.command ( 'emails' ).description ( 'commands to manipulate emails' )
  const newCourseCommands: CommandContext = { ...context, command: emailCommands }
  addEmailInitCommand ( newCourseCommands )
  addListEmailsCommand ( newCourseCommands )
  addAddEmailsCommand ( newCourseCommands )
  addRemoveEmailsCommand ( newCourseCommands )
}

export interface CommandContext {
  command: Command
  fileOps: FileOps
  gitstore: Gitstore
}
export function addInitCourseCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'init' ).description ( 'Creates a blank course file' ).option ( '-f, --force', 'force overwrite' ).action (
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
}

export function addListCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'list' ).description ( 'lists the details of the course' ).action (
    async () => {
      try {
        const course = await loadAndConvertCourse ( fileOps, courseFileName )
        console.log ( "course", JSON.stringify ( course ) )
      } catch ( e ) {
        console.log ( "error", e.message )
      }
    }
  )
}

async function createCourseFile ( fileOps: FileOps, force?: boolean ) {
  const exists = await fileOps.isFile ( courseFileName )
  if ( exists && !force ) throw new Error ( "course.txt already exists. Use --force to override" )
  console.log ( "creating course.txt" )
  let course: RawCourse = {
    title: "Untitled",
    emailFile: "emails.csv",
    rootOwner: "phil-rice",
    "rootRepo": "javaoptics",
    "token": "${env.GITHUB_TOKEN}",
    "organisation": "training-demo-for-phil"
  };
  return fileOps.saveFile ( courseFileName,
    JSON.stringify ( course, null, 2 ) )
}
async function createEmailsFile ( fileOps: FileOps, force?: boolean ) {
  const exists = await fileOps.isFile ( emailsFileName )
  if ( exists && !force ) throw new Error ( `${emailsFileName} already exists. Use --force to override` )
  console.log ( "creating emails.txt" )
  return fileOps.saveFile ( emailsFileName, "" )
}

export function addEmailInitCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'init' ).description ( 'creates a blank emails file' ).option ( '-f, --force', 'force overwrite' ).action (
    async ( opts ) => {
      try {
        await createEmailsFile ( fileOps, opts?.force );
      } catch ( e ) {
        console.log ( "error", e.message )
      }
    }
  )
}

async function loadEmails ( fileOps: FileOps ) {
  const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
  const emails = course.emails
  return emails;
}
export function addListEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'list' ).description ( 'lists the emails' ).action ( async () => {
    try {
      const emails = await loadEmails ( fileOps );
      emails.forEach ( e => console.log ( e ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
export function addAddEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'add <email>' ).description ( 'adds the email' ).action ( async ( email, opts ) => {
    try {
      const emails = (await loadEmails ( fileOps )).map ( e => e.email )
      if ( !emails.includes ( email ) )
        emails.push ( email );
      await fileOps.saveFile ( "emails.txt", emails.filter ( s => s.length > 0 ).join ( "\n" ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
export function addRemoveEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'remove <email>' ).description ( 'removes the email' ).action ( async ( email, opts ) => {
    try {
      const emails = (await loadEmails ( fileOps )).map ( e => e.email )
      await fileOps.saveFile ( "emails.txt", emails.filter ( s => s !== email ).filter ( s => s.length > 0 ).join ( "\n" ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
