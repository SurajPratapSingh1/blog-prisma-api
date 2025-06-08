import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '../generated/prisma/index.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'

dotenv.config()
const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())
app.use('/users', userRoutes(prisma))
app.use('/posts', postRoutes(prisma))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API server running on port ${PORT}`))
