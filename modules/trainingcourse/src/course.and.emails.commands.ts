import { courseFileName, emailsFileName, getEmails, loadAndConvertCourse, loadAndValidateRawCourse, RawCourse } from "./course";
import { Command } from "commander";
import { FileOps } from "@laoban/fileops";
import { Gitstore } from "./gitstore";
import { NameAnd } from "@runbook/utils";


export function addAllCourseCommands ( context: CommandContext ) {
  const courseCommands: Command = context.command.command ( 'course' ).description ( 'commands to manipulate course details' )
  const newCourseCommands: CommandContext = { ...context, command: courseCommands }
  addInitCourseCommand ( newCourseCommands )
  addListCommand ( newCourseCommands )
}
export function addAllEmailCommands ( context: CommandContext ) {
  const emailCommands: Command = context.command.command ( 'emails' ).description ( 'commands to manipulate emails' )
  const newCourseCommands: CommandContext = { ...context, command: emailCommands }
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
        await createCourseFile ( fileOps, command.optsWithGlobals (), force );
        await createEmailsFile ( fileOps, {}, command.optsWithGlobals (), force );
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
        const course = await loadAndConvertCourse ( loadAndValidateRawCourse, getEmails ) ( fileOps, command.optsWithGlobals () )
        console.log ( JSON.stringify ( course ) )
      } catch ( e ) {
        console.log ( "error", e.message )
      }
    }
  )
}

async function createCourseFile ( fileOps: FileOps, opts: NameAnd<string>, force?: boolean ) {
  const fileName = courseFileName ( opts )
  const exists = await fileOps.isFile ( fileName )
  if ( exists && !force ) throw new Error ( `${fileName} already exists. Use --force to override` )
  console.log ( `creating ${fileName}` )
  let course: RawCourse = {
    title: "Untitled",
    emailFile: emailsFileName ( {} as RawCourse, opts ),
    rootOwner: "phil-rice",
    "rootRepo": "javaoptics",
    "token": "${env.GITHUB_TOKEN}",
    "organisation": "training-demo-for-phil"
  };
  return fileOps.saveFile ( fileName, JSON.stringify ( course, null, 2 ) )
}
async function createEmailsFile ( fileOps: FileOps, course: RawCourse, opts: NameAnd<any>, force?: boolean ) {
  const fileName = emailsFileName ( course, opts )
  const exists = await fileOps.isFile ( fileName )
  if ( exists && !force ) throw new Error ( `${fileName} already exists. Use --force to override` )
  console.log ( `creating ${fileName}` )
  await fileOps.saveFile ( fileName, "" )
}


export function addListEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'list' ).description ( 'lists the emails' ).action ( async () => {
    try {
      const course = await loadAndConvertCourse ( loadAndValidateRawCourse, getEmails ) ( fileOps, command.optsWithGlobals () )
      const emails = course.emails;
      emails.forEach ( e => console.log ( e ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
export function addAddEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'add <email>' ).description ( 'adds the email' ).action ( async ( email, opts ) => {
    try {
      const course = await loadAndConvertCourse ( loadAndValidateRawCourse, getEmails ) ( fileOps, command.optsWithGlobals () )
      const emails = course.emails.map ( e => e.email );
      if ( !emails.includes ( email ) )
        emails.push ( email );
      await fileOps.saveFile ( course.emailFile, emails.filter ( s => s.length > 0 ).join ( "\n" ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
export function addRemoveEmailsCommand ( { command, fileOps }: CommandContext ) {
  command.command ( 'remove <email>' ).description ( 'removes the email' ).action ( async ( email, opts ) => {
    try {
      const course = await loadAndConvertCourse ( loadAndValidateRawCourse, getEmails ) ( fileOps, command.optsWithGlobals () )
      const emails = course.emails.map ( e => e.email );
      await fileOps.saveFile ( course.emailFile, emails.filter ( s => s !== email ).filter ( s => s.length > 0 ).join ( "\n" ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
