import { FileOps } from "@laoban/fileops";

export async function loadFile ( fileOps: FileOps, prefix: string, fileName: string ) {
  try {
    return await fileOps.loadFileOrUrl ( fileName );
  } catch ( e ) {
    throw new Error ( `Could not load file ${fileName}.

You can create a new ${fileName}file using the command: gittraining ${prefix} init
     
Cause: ${e.message}` )
  }
}