/*
 * @Author: huhaibiao
 * @Date: 2023-03-29 16:32:29
 */
import dotenv from 'dotenv'
dotenv.config()

//@ts-ignore
import { WebSocketServer } from 'ws'
import { userWs } from './usrs.js'
const server = new WebSocketServer({ port: 8088 })

server.on('connection', (socket, req) => {
  userWs(req.url, socket)
})

server.on('error', (err) => {
  console.log('errr', new Date().toLocaleTimeString())
  console.log('🚀 ~ file: index.js:120 ~ server.on ~ err:', err)
})
