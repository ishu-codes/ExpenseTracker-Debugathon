import { Router } from "express"

import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../utils/config.js'

const router = Router()

router.post('/register', async (req, res) => {
  const saltRounds = 10
  const pHash = await bcrypt.hash(req.body.password, saltRounds)
  const categories = ['Travel', 'Shopping', 'Investment', 'Bills']

  const userData = {
    fname: req.body.fname,
    lname: req.body.lname,
    pHash,
    email: req.body.email,
    categories: categories
  }
  try {
    const user = await User(userData).save()
    res.json(user)
  }catch (error){
    return res.status(409).send(error.errors.email.message)
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(401).json("User doesn't exist")
  }
  const match = await bcrypt.compare(password, user.pHash);
  if (match) {
    const payload = {
      email: user.email,
      fname: user.fname
    }
    const token = jwt.sign(payload, config.KEY, { expiresIn: '10d' })
    res.json({ user: user, token })
  } else {
    res.status(401).json('Wrong password')
  }
})

export default router