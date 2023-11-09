export interface Gitstore {
  listforks: ( owner: string, repo: string ) => Promise<ListForksData>
  fork: ( owner: string, repo: string, organisation: string, newRepo: string, token: string ) => Promise<ForkData>
  status: ( organisation: string, repo: string ) => Promise<StatusData>
  currentBranch: () => Promise<string>
  currentRepo: () => Promise<string>
}


export type FetchFn = ( url: RequestInfo, info?: RequestInit, ) => Promise<Response>
export type ExecuteFn = ( command: string, args: string[] ) => Promise<ExecuteResult>

interface ExecuteResult {
  stdout: string
  stderr: string
  code: number
}
interface ForkData {
  statusCode: number
  newRepo: string
  data?: any
  error?: string
}
interface ListForksData {
  statusCode: number
  forks: string[]
  error?: string
}
interface StatusData {
  statusCode: number
  repoData?: any
  error?: string
}

async function responseToListForksdata ( response: Response ): Promise<ListForksData> {
  const statusCode = response.status
  if ( statusCode < 300 ) {
    const json = await response.json ()
    let forks = json.map ( ( { full_name } ) => full_name );
    return { statusCode, forks }
  } else {
    const error = await response.text ()
    return { statusCode, error, forks: [] }
  }

}

const listForksForGithub = ( fetch: FetchFn ) => ( owner: string, repo: string ) => {
  let url = `https://api.github.com/repos/${owner}/${repo}/forks`;
  return fetch ( url ).then ( responseToListForksdata )
}
const responseToForkData = ( newRepo: string ) => async ( response: Response ): Promise<ForkData> => {
  const statusCode = response.status
  if ( statusCode < 300 ) {
    const data = await response.json ()
    return Promise.resolve ( { statusCode, newRepo, data } )
  } else {
    return response.text ().then ( error => ({ statusCode, newRepo, error }) )
  }
};
const forkGithub = ( fetch: FetchFn ) => ( owner: string, repo: string, organisation: string, newRepo: string, token: string ) => {
  let url = `https://api.github.com/repos/${owner}/${repo}/forks`;
  let rawHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json'
  };
  const headers = new Headers ( rawHeaders );
  let rawBody = { organisation, name: newRepo, default_branch_only: false };
  let requestDetails = { method: 'POST', headers, body: JSON.stringify ( rawBody ) };
  console.log ( 'url', url )
  console.log ( 'rawHeaders', rawHeaders )
  console.log ( 'requestDetails', JSON.stringify ( requestDetails ) )
  console.log ( 'rawBody', JSON.stringify ( rawBody ) )

  return fetch ( url, requestDetails ).then ( responseToForkData ( newRepo ) )
}
const statusForGithub = ( fetch: FetchFn ) => async ( organisation: string, repo: string ): Promise<StatusData> => {
  let url = `https://api.github.com/repos/${organisation}/${repo}`;
  console.log ( 'url', url )
  console.log ( 'organisation', organisation )
  console.log ( 'repo', repo )
  return fetch ( url ).then ( async response => {
    const statusCode = response.status
    if ( statusCode < 300 ) {
      const repoData = await response.json ()
      return Promise.resolve ( { statusCode, repoData } )
    } else {
      return response.text ().then ( error => ({ statusCode, error }) )
    }
  } )
};

export const currentBranch = ( execute: ExecuteFn ) => {
  return () => {
    return execute ( 'git', [ 'branch', '--show-current' ] ).then ( ( { stdout, stderr, code } ) => {
      if ( code !== 0 ) throw new Error ( `git branch --show-current failed with code ${code} and stderr ${stderr}` )
      if ( stdout.trim ().length === 0 ) throw new Error ( `git branch --show-current failed with code ${code} and stderr ${stderr}` )
      return stdout.trim ()
    } )
  }
}
export const currentRepo = ( execute: ExecuteFn ) => {
  return () => {
    return execute ( 'git', [ 'config', '--get', 'remote.origin.url' ] ).then ( ( { stdout, stderr, code } ) => {
      if ( code !== 0 ) throw new Error ( `git config --get remote.origin.url failed with code ${code} and stderr ${stderr}` )
      if ( stdout.trim ().length === 0 ) throw new Error ( `git config --get remote.origin.url failed with code ${code} and stderr ${stderr}` )
      return stdout.trim ()
    } )
  }
}
export const GithubStore = ( fetch: FetchFn, executeFn: ExecuteFn ): Gitstore => ({
  listforks: listForksForGithub ( fetch ),
  fork: forkGithub ( fetch ),
  status: statusForGithub ( fetch ),
  currentBranch: currentBranch ( executeFn ),
  currentRepo: currentRepo ( executeFn )
})