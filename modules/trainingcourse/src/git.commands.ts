import { CommandContext } from "./course.and.emails.commands";
import { Command } from "commander";
import { getEmails, loadAndConvertCourse, loadAndValidateRawCourse } from "./course";

export function addAllGitCommands ( context: CommandContext ): void {
  const gitCommands: Command = context.command.command ( 'git' ).description ( 'commands to setup git repos for the students taking the course' )
  const newContext: CommandContext = { ...context, command: gitCommands }
  addGitStatusCommand ( newContext )
  addGitSetupCommand ( newContext )
}
export function addGitSetupCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'setup' ).description ( 'setups the git repos for the students in the email list' ).action ( async ( opts ) => {

  } );

}

export function addGitStatusCommand ( { command, fileOps, gitstore }: CommandContext ) {
  command.command ( 'status' ).description ( 'finds the status of the git repos for the students in the email list' ).action ( async ( opts ) => {
    try {
      const course = await loadAndConvertCourse ( loadAndValidateRawCourse, getEmails ) ( fileOps, command.optsWithGlobals () )
      const emails = course.emails;
      Promise.all ( emails.map ( e => gitstore.status ( course.organisation, e.clean ) ) ).then ( statuses => console.log ( JSON.stringify ( statuses ) ) )
    } catch ( e ) {
      console.log ( "error", e.message )
    }
  } )
}