import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie';
import call from '../../lib/micro';

interface RequestBody {
  email?: string;
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const params: RequestBody = JSON.parse(req.body)

  try {
    const rsp = await call("/users/Login", params)
    res.setHeader('Set-Cookie', serialize('token', rsp.token, { path: '/' }));
    res.status(200).json(rsp);
  } catch ({ error, code }) {
    res.status(code).json({ error })
  }
}
