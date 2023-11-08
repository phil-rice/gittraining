import { FileOps, parseJson } from "@laoban/fileops";
import { composeNameAndValidators, validateChildString } from "@runbook/utils";

export interface RawSharedCourseDetails {
  title?: string
  organisation?: string
  rootOwner?: string
  rootRepo?: string
}

interface EmailData {
  email: string
  clean: string
  repo: string
}
function getClean ( email: string ) {
  return email
    .replace ( /@/g, '_at' )
    .replace ( /[^a-zA-Z0-9-_@]/g, '' )
    .toLowerCase ();
}
export const toEmailData = ( organisation: string ) => ( email: string ): EmailData => {
  let clean = getClean ( email );
  let repo = `${organisation}/${clean}`;
  return ({ email, clean, repo });
};
export interface RawCourse extends RawSharedCourseDetails {
  emailFile?: string
}

export interface Course extends Required<RawSharedCourseDetails> {
  emails: EmailData[]
}

export async function convertCourse ( fileOps: FileOps, rawCourse: RawCourse ): Promise<Course> {
  const emailsString = await loadFile ( fileOps, 'emails', rawCourse.emailFile );
  const organisation = rawCourse.organisation
  const emails = emailsString.split ( "\n" ).filter ( s => s.length > 0 ).map ( toEmailData ( organisation ) );
  let course: Course = { ...rawCourse, emails } as Course;
  return course
}

export async function loadFile ( fileOps: FileOps, prefix: string, courseFileName: string ) {
  try {
    return await fileOps.loadFileOrUrl ( courseFileName );
  } catch ( e ) {
    throw new Error ( `Could not load file ${courseFileName}.

You can create a new ${courseFileName}file using the command: gittraining ${prefix} init
     
Cause: ${e.message}` )
  }
}

export function validateRawCourse ( course: RawCourse ): string[] {
  const v = composeNameAndValidators<RawCourse> (
    validateChildString ( 'title' ),
    validateChildString ( 'emailFile' ),
    validateChildString ( 'rootOwner' ),
    validateChildString ( 'rootRepo' ),
    validateChildString ( 'organisation' ),
  )
  return v ( '' ) ( course )
}


export async function loadAndConvertCourse ( fileOps: FileOps, courseFileName: string ): Promise<Course> {
  let rawFileDetails = await loadFile ( fileOps, 'course', courseFileName );
  const rawCourse = parseJson<RawCourse> ( () => courseFileName ) ( rawFileDetails )
  let errors = validateRawCourse ( rawCourse );
  if ( errors.length > 0 ) throw new Error ( `Course file ${courseFileName} is invalid:\n${errors.join ( "\n" )}` )
  return convertCourse ( fileOps, rawCourse );
}