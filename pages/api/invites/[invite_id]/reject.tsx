import { NextApiRequest, NextApiResponse } from 'next'
import call from '../../../../lib/micro'
import TokenFromReq from '../../../../lib/token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query: { invite_id } } = req;

  if(req.method !== 'POST') {
    res.status(405).json({})
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

  // load the invite
  var invite: any
  try {
    const rsp = await call("/invites/Read", { id: invite_id })
    invite = rsp.invite
  } catch ({ error, code }) {
    console.error(`Error loading invite: ${error}, code: ${code}`)
    res.status(code).json({ error })
    return
  }
  
  // check the user was infact the one who was sent the invite
  if(invite.email !== user.email) {
    res.status(400).json({ error: "Your email does not match the invite" })
    return
  }

  // delete the invitation
  try {
    await call("/invites/Delete", { id: invite.id })
  } catch ({ error, code }) {
    console.error(`Error deleting invite: ${error}, code: ${code}`)
    res.status(500).json({ error: "Error accepting invitation" })
    return
  }

  res.status(200).json({})
}
