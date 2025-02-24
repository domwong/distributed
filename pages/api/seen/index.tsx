import { NextApiRequest, NextApiResponse } from 'next'
import call from '../../../lib/micro'
import TokenFromReq from '../../../lib/token'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  // ignore any OPTIONS requests
  if(!['GET', 'POST']?.includes(req.method)) {
    res.status(200)
    return
  }

  // get the token from cookies
  const token = TokenFromReq(req)
  if(!token) {
    res.status(401).json({ error: "No token cookie set" })
    return
  }

  // authenticate the request
  var user: any
  try {
    const rsp = await call("/users/Validate", { token })
    user = rsp.user
  } catch ({ error, code }) {
    if(code === 400) code = 401
    res.status(code).json({ error })
    return
  }

  // parse the request body
  var body = {}
  try {
    body = JSON.parse(req.body)
  } catch (error) {
    res.status(400).json({ error: `Error parsing request body: ${error}`})
    return
  }

  // update the last seen time
  try {
    await call("/seen/Set", { user_id: user.id, ...body })
    res.status(200).json({})
  } catch ({ error, code }) {
    console.error(`Error updating last seen: ${error}, code: ${code}`)
    res.status(500).json({ error: "Error updating last seen time"})
  }
}