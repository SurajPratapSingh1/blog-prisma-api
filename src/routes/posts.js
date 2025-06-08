import jwt from 'jsonwebtoken'
const express = require('express')
const JWT_SECRET = process.env.JWT_SECRET

function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if(!token) return res.status(401).send('No token')

    try {
        req.user = jwt.verify(token, JWT_SECRET)
        next()
    } catch {
        res.status(401).send('Invalid Token');
    }
}

export default function (prisma) {
    const router = express.Router()

    router.get('/', async (req,res) => {
        const posts = await prisma.post.findMany({
            include : { author : { select : {username : true}}},
        })
        res.json(posts);
    })

    router.post('/', auth, async(req,res) => {
        const {title, body} = req.body
        const post = await prisma.post.create({
            data : { title, body, authorId : req.user.id },
        })
        res.json(post)
    })

    router.get('/:id', async (req, res) => {
        const post = await prisma.post.findUnique({
            where : { id : req.params.id },
            include : { author : true},
        })
        post ? res.json(post) : res.status(404).send('Not Found')
    })

    router.put('/:id', auth, async (req, res) => {
        const post = await prisma.post.findUnique({ where : { id : req.params.id }})
        if(!post || post.authorId !== req.user.id)
            return res.status(403).send('Unauthorized')
        const updated = await prisma.post.update({
            where : {id : req.params.id },
            data : req.body,
        })
        res.json(updated)
    })

    router.delete('/:id', auth, async (req,res) => {
        const post = await prisma.post.findUnique({ where : {id : req.params.id }})
        if(!post || post.authorId !== req.user.id)
            return res.status(403).send('Unauthorized')
        await prisma.post.delete({ where : { id : req.params.id }})
        res.send('Deleted')
    })

    return router
}