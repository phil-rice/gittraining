import { Course, CourseAndEmailOps, courseFileName, EmailData, emailsFileName, getClean, loadAndConvertCourse, RawCourse, toEmailData } from "./course";
import { loadFile } from "./load.file";
import { afterEach } from "node:test";
import { FileOps } from "@laoban/fileops";


describe ( 'course', () => {

  describe ( 'getClean function', () => {
    it ( 'cleans the email according to various rules', () => {
      expect ( getClean ( 'user@example.com' ) ).toBe ( 'user_at_example.com' );
      expect ( getClean ( 'User@Example.com' ) ).toBe ( 'user_at_example.com' );
      expect ( getClean ( 'user+name@example.com' ) ).toBe ( 'username_at_example.com' );
      expect ( getClean ( 'user-name@example.com' ) ).toBe ( 'user-name_at_example.com' );
      expect ( getClean ( 'user.name@example.com' ) ).toBe ( 'user.name_at_example.com' );
      expect ( getClean ( 'user_name@example.com' ) ).toBe ( 'user_name_at_example.com' );
      expect ( getClean ( 'user@sub.example.com' ) ).toBe ( 'user_at_sub.example.com' );
      expect ( getClean ( 'user@example.co.uk' ) ).toBe ( 'user_at_example.co.uk' );
      expect ( getClean ( 'user!#$%&\'*+/=?^`{|}~@example.com' ) ).toBe ( 'user_at_example.com' );
      expect ( getClean ( '' ) ).toBe ( '' );
    } );
  } );
  describe ( 'toEmailData', () => {
    it ( 'should return EmailData with correct properties', () => {
      const email = 'user@example.com';
      const organisation = 'org';
      const expected = {
        email: 'user@example.com',
        clean: 'user_at_example.com',
        repo: 'org/user_at_example.com',
      };
      expect ( toEmailData ( organisation ) ( email ) ).toEqual ( expected );
    } );
  } );
} )
describe ( 'courseFileName', () => {
  it ( 'should return the provided course file name', () => {
    const opts = { course: 'custom_course.json' };
    expect ( courseFileName ( opts ) ).toBe ( 'custom_course.json' );
  } );

  it ( 'should return the default course file name when none is provided', () => {
    const opts = {};
    expect ( courseFileName ( opts ) ).toBe ( 'course.json' );
  } );
  describe ( 'emailsFileName', () => {
    it ( 'should return the provided emails file name', () => {
      const course: RawCourse = {};
      const opts = { emailFile: 'custom_emails.csv' };
      expect ( emailsFileName ( course, opts ) ).toBe ( 'custom_emails.csv' );
    } );

    it ( 'should return the course email file name when provided', () => {
      const course: RawCourse = { emailFile: 'course_emails.csv' };
      const opts = {};
      expect ( emailsFileName ( course, opts ) ).toBe ( 'course_emails.csv' );
    } );

    it ( 'should return the default emails file name when none is provided', () => {
      const course: RawCourse = {};
      const opts = {};
      expect ( emailsFileName ( course, opts ) ).toBe ( 'emails.csv' );
    } );
  } );


  const mockFileOps = {
    loadFileOrUrl: jest.fn (),
  };

  describe ( 'loadFile function', () => {
    const fileName = 'test.txt';
    const prefix = 'testprefix';

    beforeEach ( () => {
      jest.clearAllMocks ();
    } );

    it ( 'successfully loads the file content', async () => {
      const fileContent = 'File content';
      mockFileOps.loadFileOrUrl.mockResolvedValue ( fileContent );

      const content = await loadFile ( mockFileOps as any, prefix, fileName );
      expect ( content ).toBe ( fileContent );
      expect ( mockFileOps.loadFileOrUrl ).toHaveBeenCalledWith ( fileName );
    } );

    it ( 'throws an error with a detailed message when the file cannot be loaded', async () => {
      const errorMessage = 'File not found';
      mockFileOps.loadFileOrUrl.mockRejectedValue ( new Error ( errorMessage ) );
      const expectedError = new Error ( `Could not load file ${fileName}.\n\nYou can create a new ${fileName}file using the command: gittraining ${prefix} init\n     \nCause: ${errorMessage}` );

      await expect ( loadFile ( mockFileOps as any, prefix, fileName ) ).rejects.toEqual ( expectedError );
      expect ( mockFileOps.loadFileOrUrl ).toHaveBeenCalledWith ( fileName );
    } );
  } );


  describe ( 'loadAndConvertCourse function', () => {
    // Simple mock for FileOps
    const mockFileOps: FileOps = { mock: "fileops" } as any;

    // Mock implementations for loadRawCourse and getEmails
    const mockLoadRawCourse = jest.fn ();
    const mockGetEmails = jest.fn ();

    const opts: CourseAndEmailOps = {}; // Define opts as needed

    const rawCourse: RawCourse = { organisation: 'TestOrg' }; // Example raw course
    const emails = [ 'email1@example.com', 'email2@example.com' ]; // Example emails
    const emailData: EmailData[] = emails.map ( toEmailData ( rawCourse.organisation ) )
    const course: Course = { ...rawCourse, emails: emailData } as Course;

    beforeEach ( () => {
      jest.clearAllMocks ();
      mockLoadRawCourse.mockResolvedValue ( rawCourse ); // Mock successful raw course load
      mockGetEmails.mockResolvedValue ( emailData ); // Mock successful email retrieval
    } );

    it ( 'successfully loads and converts a course', async () => {
      const convertCourseFn = loadAndConvertCourse ( mockLoadRawCourse, mockGetEmails );

      const result = await convertCourseFn ( mockFileOps, opts );

      expect ( mockLoadRawCourse ).toHaveBeenCalledWith ( mockFileOps, opts );
      expect ( mockGetEmails ).toHaveBeenCalledWith ( mockFileOps, rawCourse, opts, rawCourse.organisation );
      expect ( result ).toEqual ( course );
    } );

    afterEach ( () => {
      jest.restoreAllMocks ();
    } );
  } );
} )
