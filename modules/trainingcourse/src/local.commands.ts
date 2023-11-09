import { CommandContext } from "./course.and.emails.commands";

export function addLocalCommands ( context: CommandContext ) {
  const localCommands = context.command.command ( 'local' ).description ( 'commands to check the local git repo. This is mostly for debugging' )
  const newContext: CommandContext = { ...context, command: localCommands }
  addLocalRepoCommand ( newContext )
  addLocalBranchCommand ( newContext )
}
export function addLocalBranchCommand ( { gitstore, command }: CommandContext ) {
  command.command ( 'branch' ).description ( 'reports the current branch' ).action ( async () => {
    const branch = await gitstore.currentBranch ()
    console.log ( branch )
  } )
}
export function addLocalRepoCommand ( { gitstore, command }: CommandContext ) {
  command.command ( 'repo' ).description ( 'reports the current repo' ).action ( async () => {
    const repo = await gitstore.currentRepo ()
    console.log ( repo )
  } )
}