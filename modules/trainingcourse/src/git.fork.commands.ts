import { Command } from "commander";
import { loadAndConvertCourse } from "./course";
import { CommandContext } from "./course.and.emails.commands";


export function addGitCommands ( context: CommandContext ) {
  const gitCommands: Command = context.command.command ( 'git' ).description ( 'commands to create and report on git repos for the students taking the course' )
  const newContext: CommandContext = { ...context, command: gitCommands }
  addGitStatusCommand ( newContext )
  addGitForkCommand ( newContext )
  addGitListForksCommand ( newContext )
}

export function addGitStatusCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'status' ).description ( 'finds the status of the git repos for the students in the email list' ).action ( async ( opts ) => {
    try {
      const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
      const emails = course.emails;
      Promise.all ( emails.map ( e => gitstore.status ( course.organisation, e.clean ) ) ).then ( statuses => console.log ( JSON.stringify ( statuses ) ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}
export function addGitListForksCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'listforks' ).description ( 'A debug capability: lists all the forks of the original repo' ).action ( async () => {
    try {
      const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
      const forks = await gitstore.listforks ( course.rootOwner, course.rootRepo )
      console.log ( JSON.stringify ( forks ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}

export function addGitForkCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'fork' ).description ( 'forks the original repo for each student' ).action ( async () => {
    try {
      const course = await loadAndConvertCourse ( fileOps, 'course.txt' )
      const emails = course.emails;
      const forks = await Promise.all ( emails.map ( e => gitstore.fork ( course.rootOwner, course.rootRepo, course.organisation, e.clean, course.token ) ) )
      console.log ( JSON.stringify ( forks ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }

  } )
}
