import * as Console from "console";

export interface Gitstore {
  listforks: ( owner: string, repo: string ) => Promise<ListForksData>
}


type FetchFn = ( url: string ) => Promise<Response>


interface ListForksData {
  statusCode: number
  forks: string[]
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
export const GithubStore = ( fetch: FetchFn ): Gitstore => ({
  listforks: listForksForGithub ( fetch )
})