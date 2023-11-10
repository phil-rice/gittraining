import { execute } from "./execute";
import { executeOrError } from "./gitstore";
import { findFileUp } from "@laoban/fileops";
import { fileOpsNode } from "@laoban/filesops-node";

const fileOps = fileOpsNode ()
const executeCommand = async ( cmd: string ) => {
  const rootDir = await findFileUp ( '.', s => fileOps.isFile ( "package.json" ) )
  return await executeOrError ( execute ) ( "node " + rootDir + "/dist/index.js " + cmd )
}

const waitForPredicate = async (
  predicate: () => Promise<boolean>,
  timeoutMs: number  = 5000,
  intervalMs: number = 100
): Promise<void> => {
  const startTime = Date.now ();
  while ( Date.now () - startTime < timeoutMs ) {
    if ( await predicate () ) {
      return;
    }
    await new Promise<void> ( resolve => setTimeout ( resolve, intervalMs ) );
  }
  throw new Error ( `Timeout waiting for predicate to be true` );
};
describe ( "git commands", () => {
  it ( "should report the current branch", async () => {
    const result = await executeCommand ( "local branch" )
    expect ( result ).toEqual ( "master" )
  } )
  it ( "should report the current repo", async () => {
    const result = await executeCommand ( "local repo" )
    expect ( result ).toEqual ( "git@github.com:phil-rice/gittraining.git" )
  } )
} )
const defaultCourseFile = "course.json"
const customFileName = "custom_course.json"
const defaultEmailsFile = "emails.csv"
const customEmailsFile = "emails.csv"
async function clean () {
  await fileOps.removeFile ( defaultCourseFile )
  await fileOps.removeFile ( customFileName )
  await fileOps.removeFile ( defaultEmailsFile )
  await fileOps.removeFile ( customEmailsFile );
}
describe ( "course commands", () => {

  beforeEach ( async () => {
    await clean ()
  } )
  afterEach ( async () => {
    await clean ()
  } )
  describe ( "init", () => {
    it ( "should create a file with the default name if no name is provided", async () => {
      const result = await executeCommand ( "course init" )
      expect ( result ).toEqual ( `creating ${defaultCourseFile}\ncreating ${defaultEmailsFile}` )
      expect ( await fileOps.isFile ( defaultCourseFile ) ).toEqual ( true )
      expect ( await fileOps.isFile ( defaultEmailsFile ) ).toEqual ( true )
    } )
    it ( "should create a file with the provided names", async () => {
      const result = await executeCommand ( `course init --course ${customFileName} --emailfile ${customEmailsFile}` )
      expect ( result ).toEqual ( `creating ${customFileName}\ncreating ${defaultEmailsFile}` )
      expect ( await fileOps.isFile ( customFileName ) ).toEqual ( true )
      expect ( await fileOps.isFile ( customEmailsFile ) ).toEqual ( true )
    } )
    it ( "should object if the course file already exists", async () => {
      await fileOps.saveFile ( defaultCourseFile, "some content" )
      const result = await executeCommand ( "course init" )
      expect ( result ).toEqual ( `error course.json already exists. Use --force to override` )
    } )
    it ( "should object if the email file already exists", async () => {
      await fileOps.saveFile ( defaultEmailsFile, "some content" )
      const result = await executeCommand ( "course init" )
      expect ( result ).toContain ( `error emails.csv already exists. Use --force to override` )
      expect ( await fileOps.isFile ( customFileName ) ).toEqual ( false )
    } )
    it ( "should create if the course file already exists but there is a --force", async () => {
      await fileOps.saveFile ( defaultCourseFile, "some content" )
      const result = await executeCommand ( "course init --force" )
      expect ( result ).toEqual ( `creating ${defaultCourseFile}\ncreating ${defaultEmailsFile}` )
    } )
    it ( "should create if the email file already exists but there is a --force", async () => {
      await fileOps.saveFile ( defaultEmailsFile, "some content" )
      const result = await executeCommand ( "course init --force" )
      expect ( result ).toEqual ( `creating ${defaultCourseFile}\ncreating ${defaultEmailsFile}` )
    } )
  } )
  describe ( "list", () => {
    it ( "should list the emails", async () => {
      await executeCommand ( "course init" )
      await fileOps.saveFile ( defaultEmailsFile, "a+b@example.com\nb\nc" )
      const result = await executeCommand ( "course list" )
      const json = JSON.parse ( result )
      expect ( json.token ).toEqual ( process.env.GITHUB_TOKEN )
      delete json.token

      expect ( json ).toEqual ( {
        "emailFile": "emails.csv",
        "emails": [
          {
            "clean": "ab_at_example.com",
            "email": "a+b@example.com",
            "repo": "training-demo-for-phil/ab_at_example.com"
          },
          {
            "clean": "b",
            "email": "b",
            "repo": "training-demo-for-phil/b"
          },
          {
            "clean": "c",
            "email": "c",
            "repo": "training-demo-for-phil/c"
          }
        ],
        "organisation": "training-demo-for-phil",
        "rootOwner": "phil-rice",
        "rootRepo": "javaoptics",
        "title": "Untitled"
      } )
    } )
  } )
} )
describe ( "email commands", () => {
  beforeEach ( async () => {
    await clean ();
  } )
  afterEach ( async () => {
    await clean ();
  } )
  // describe ( "init", () => {
  //   it ( "should create a file with the default name if no name is provided", async () => {
  //     const result = await executeCommand ( "emails init" )
  //     expect ( result ).toEqual ( `creating ${defaultEmailsFile}` )
  //     expect ( await fileOps.isFile ( defaultEmailsFile ) ).toEqual ( true )
  //   } )
  //   it ( "should create a file with the provided name", async () => {
  //     const result = await executeCommand ( `emails init --emailfile ${customEmailsFile}` )
  //     expect ( result ).toEqual ( `creating ${customEmailsFile}` )
  //     expect ( await fileOps.isFile ( customEmailsFile ) ).toEqual ( true )
  //   } )
  //   it ( "should object if the email file already exists", async () => {
  //     await fileOps.saveFile ( defaultEmailsFile, "some content" )
  //     const result = await executeCommand ( "emails init" )
  //     expect ( result ).toContain ( `error emails.csv already exists. Use --force to override` )
  //     expect ( await fileOps.isFile ( customFileName ) ).toEqual ( false )
  //
  //   } )
  //   it ( "should create if the email file already exists but there is a --force", async () => {
  //     await fileOps.saveFile ( defaultEmailsFile, "some content" )
  //     const result = await executeCommand ( "emails init --force" )
  //     expect ( result ).toEqual ( `creating ${defaultEmailsFile}` )
  //   } )
  // } )
  describe ( "add", () => {
    it ( "should add an email to the default file", async () => {
      await executeCommand ( "course init" )
      await executeCommand ( "emails add phil@email.com" )
      await executeCommand ( "emails add phil@email.com" )
      await executeCommand ( "emails add alyson@email.com" )
      const content = (await fileOps.loadFileOrUrl ( defaultEmailsFile )).split ( "\n" ).filter ( s => s.length > 0 )
      expect ( content ).toEqual ( [ "phil@email.com", "alyson@email.com" ] )
    } )
  } )
  describe ( "remove", () => {
    it ( "should remove an email ", async () => {
      await executeCommand ( "course init" )
      await waitForPredicate ( async () => await fileOps.isFile ( defaultEmailsFile ) )
      expect ( await fileOps.isFile ( defaultEmailsFile ) ).toEqual ( true )
      await executeCommand ( "emails add phil@email.com" )
      await executeCommand ( "emails remove phil@email.com" )
      await executeCommand ( "emails add alyson@email.com" )
      const content = (await fileOps.loadFileOrUrl ( defaultEmailsFile )).split ( "\n" ).filter ( s => s.length > 0 )
      expect ( content ).toEqual ( [ "alyson@email.com" ] )
    } )
  } )
} )
