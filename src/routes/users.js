import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET 
import express from 'express'

export default function (prisma) {
    const router = express.Router()

    router.post('/signup', async (req, res) => {
        const { username, email, password } = req.body;
        const existing = await prisma.user.findUnique({ where : { email }});
        if (existing) return res.status(400).send('Email already in use');
        const hash = await bcrypt.hash(password, 10)
        await prisma.user.create({ data : {username, email, password: hash}});
        res.send('User registered')
    })

    router.post('/signin', async (req,res) => {
        const { email, password } = req.body
        const User = await prisma.user.findUnique({ where : {email}})
        if(!user || !(await bcrypt.compare(password, User.password)))
            return res.status(401).send('Invalid Credentials')
        const token = jwt.sign({ id : User.id }, JWT_SECRET, {expiresIn : '7d' })
        res.json({ token }) 
    })
    return router;
}