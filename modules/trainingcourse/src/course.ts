import { FileOps, parseJson } from "@laoban/fileops";
import { composeNameAndValidators, NameAnd, validateChildString } from "@runbook/utils";
import { derefence } from "@laoban/variables";
import { dollarsBracesVarDefn } from "@laoban/variables/dist/src/variables";
import { loadFile } from "./load.file";

export type CourseAndEmailOps = {
  course?: string
  emailFile?: string
  emails?: string[]
}
const defaultCourseFileName = "course.json"
const defaultEmailsFileName = "emails.csv"
export interface RawSharedCourseDetails {
  title?: string
  organisation?: string
  token?: string
  rootOwner?: string
  rootRepo?: string
  emailFile?: string
}

export interface EmailData {
  email: string
  clean: string
  repo: string
}
export function getClean ( email: string ) {
  return email
    .replace ( /@/g, '_at_' )
    .replace ( /[^a-zA-Z0-9-_@.]/g, '' )
    .toLowerCase ();
}
export const toEmailData = ( organisation: string ) => ( email: string ): EmailData => {
  let clean = getClean ( email );
  let repo = `${organisation}/${clean}`;
  return ({ email, clean, repo });
};
export interface RawCourse extends RawSharedCourseDetails {

}

export function courseFileName ( opts: CourseAndEmailOps ) {
  return opts.course ?? defaultCourseFileName
}
export function emailsFileName ( course: RawCourse, opts: CourseAndEmailOps ) {
  return opts.emailFile ?? course.emailFile ?? defaultEmailsFileName
}

export interface Course extends Required<RawSharedCourseDetails> {
  emails: EmailData[]
}

export type GetEmailsFn = ( fileOps: FileOps, rawCourse: RawCourse, opts: CourseAndEmailOps, organisation: string ) => Promise<EmailData[]>
export const getEmails: GetEmailsFn = async ( fileOps: FileOps, rawCourse: RawCourse, opts: NameAnd<any>, organisation: string ) => {
  if ( opts.emails ) return opts.emails;
  const emailsString = await loadFile ( fileOps, 'emails', emailsFileName ( rawCourse, opts ) );
  const emails = emailsString.split ( "\n" ).filter ( s => s.length > 0 ).map ( toEmailData ( organisation ) );
  return emails;
};

export function validateRawCourse ( course: RawCourse ): string[] {
  const v = composeNameAndValidators<RawCourse> (
    validateChildString ( 'emailFile' ),
    validateChildString ( 'rootOwner' ),
    validateChildString ( 'rootRepo' ),
    validateChildString ( 'title' ),
    validateChildString ( 'token' ),
    validateChildString ( 'organisation' ),
  )
  return v ( '' ) ( course )
}


export type LoadAndValidateFn<T> = ( fileOps: FileOps, opts: CourseAndEmailOps ) => Promise<T>
export const loadAndValidateRawCourse: LoadAndValidateFn<RawCourse> = async ( fileOps: FileOps, opts: NameAnd<string> ): Promise<RawCourse> => {
  let fileName = courseFileName ( opts );
  let rawFileDetails = await loadFile ( fileOps, 'course', fileName );

  const fileDetails = derefence ( fileName, { env: process.env }, rawFileDetails, { variableDefn: dollarsBracesVarDefn, throwError: true } )
  const rawCourse = parseJson<RawCourse> ( () => fileName ) ( fileDetails )
  let errors = validateRawCourse ( rawCourse );
  if ( errors.length > 0 ) throw new Error ( `Course file ${courseFileName} is invalid:\n${errors.join ( "\n" )}` )
  return rawCourse;
};
export const loadAndConvertCourse = ( loadRawCourse: LoadAndValidateFn<RawCourse> , getEmails: GetEmailsFn): LoadAndValidateFn<Course> => async ( fileOps: FileOps, opts: CourseAndEmailOps ): Promise<Course> => {
  const rawCourse = await loadRawCourse ( fileOps, opts );
  const organisation = rawCourse.organisation
  const emails = await getEmails ( fileOps, rawCourse, opts, organisation );
  let course: Course = { ...rawCourse, emails } as Course;
  return course
};