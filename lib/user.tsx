import useSWR from 'swr';

export interface User {
  first_name: String;
  last_name: String;
  email: String;
}

export interface SignupParams {
  first_name: String;
  last_name: String;
  email: String;
  password: String;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useUser (): { user?: User, loading: boolean, error: Error } {
  const { data, error } = useSWR("/api/profile", fetcher);
  
  return {
    user: error ? undefined : data?.user,
    loading: !error && !data,
    error: error,
  }
}

export function login(email: string, password: string): Promise<User> {
  return new Promise<User>((resolve: Function, reject: Function) => {
    fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      .then(async (rsp) => {
        const body = await rsp.json()
        rsp.status === 200 ? resolve(body) : reject(body.error || rsp.statusText);
      })
      .catch(err => reject(err))
  })
}

export function logout(): { loading: boolean; error: Error } {
  const { data, error } = useSWR("/api/logout", fetcher);

  return {
    loading: !error && !data,
    error: error,
  }
}

export function signup(params: SignupParams): Promise<User> {
  return new Promise<User>((resolve: Function, reject: Function) => {
    fetch('/api/signup', { method: 'POST', body: JSON.stringify(params) })
      .then(async (rsp) => {
        try {
          const body = await rsp.json()
          rsp.status === 200 ? resolve(body) : reject(body.error || rsp.statusText);
        } catch {
          rsp.status === 200 ? resolve({}) : reject(rsp.statusText);
        }
      })
      .catch(err => reject(err))
  })
}
