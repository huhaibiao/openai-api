/*
 * @Author: huhaibiao
 * @Date: 2023-05-23 23:27:19
 */

import { postOpenApi } from './post.js'
import { useProcessRequests } from './useRequest.js'
import { sendData } from './utils.js'

/**用户相关，保存所有用户链接 */
const wss = new Map()
let questionsNum = 0
export const userWs = (requestUrl, socket) => {
  const sessionId = requestUrl.split('=')[2]
  console.log('链接成功', new Date().toLocaleString())
  let messages = [{ role: 'system', content: 'You are a professional front end assistant.' }]
  if (wss.has(sessionId)) {
    let userWss = wss.get(sessionId)
    messages = userWss.messages
  } else {
    wss.set(sessionId, { socket, messages })
  }
  socket.send(JSON.stringify(sendData()))
  for (const value of wss.values()) {
    value.socket.send(JSON.stringify(sendData(wss.size, 1)))
    value.socket.send(JSON.stringify(sendData(questionsNum, 2)))
  }

  socket.on('message', (message) => {
    const reserver = message.toString()
    const resData = JSON.parse(reserver)
    if (reserver.length > 1000) {
      socket.send(JSON.stringify({ content: '目前不允许输入超1000字', id: resData.index }))
      return
    }
    if (reserver === 'ping') {
      // console.log(`Received message: ${reserver}`);
    } else {
      const questionTime = new Date().toLocaleString()
      questionsNum++
      for (const value of wss.values()) {
        value.socket.send(JSON.stringify(sendData(questionsNum, 2)))
      }
      const quest = [resData.req, socket, messages, resData.index]
      const callback = (reps) => {
        questionsNum -= reps.length
        reps.forEach((rep) => {
          const jsonStr = JSON.stringify(
            sendData(
              {
                question: resData.req,
                rep,
                questionTime,
                repTime: new Date().toLocaleString()
              },
              3
            )
          )
          for (const value of wss.values()) {
            value.socket.send(jsonStr)
            value.socket.send(JSON.stringify(sendData(questionsNum, 2)))
          }
        })
      }
      useProcessRequests(quest, postOpenApi, callback)
    }
  })
  socket.on('close', () => {
    console.log('Client disconnected', 'time:' + new Date().toLocaleTimeString())
    socket.shouldStop = true
    wss.delete(sessionId)
    for (const value of wss.values()) {
      value.socket.send(JSON.stringify(sendData(wss.size, 1)))
    }
  })
}
