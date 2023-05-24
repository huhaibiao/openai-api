import axios from 'axios'
import { sendData } from './utils.js'

/*
 * @Author: huhaibiao
 * @Date: 2023-05-23 21:40:48
 */
export const postOpenApi = (request, socket, messages, id) => {
  let rep = ''
  messages.push({ role: 'user', content: request })
  const l = messages.length
  if (l >= 7) {
    messages.splice(1, l - 4)
  }
  const instance = new AbortController()

  return new Promise((resolve, reject) => {
    axios
      .post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo-0301',
          messages,
          temperature: 0,
          stream: true,
          n: 1,
          user: 'user'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          signal: instance.signal
        }
      )
      .then((response) => {
        response.data.on('data', (chunk) => {
          if (socket.shouldStop) {
            const data = sendData()
            data.id = id
            data.msg = 'DONE'
            socket.send(JSON.stringify(data))
            messages.push({ role: 'assistant', content: rep })
            resolve(rep)
            instance.abort()
            console.log('已取消此次回复', new Date().toLocaleTimeString())
            return
          }
          const dataStr = chunk.toString()
          const dataArr = dataStr.split('\n').filter((item) => item)
          dataArr.forEach((v) => {
            try {
              const item = JSON.parse(v.slice(6))
              if (item.choices.finish_reason === 'stop') {
                console.log(
                  '🚀 ~ file: index.js:48 ~ postOpenAi ~ item.choices.finish_reason:',
                  item.choices.finish_reason
                )
                const data = sendData()
                data.id = id
                data.msg = 'DONE'
                socket.send(JSON.stringify(data))
                messages.push({ role: 'assistant', content: rep })
                resolve(rep)
              } else {
                const content = item.choices[0].delta.content
                if (!!!content) {
                  return
                }
                rep += content
                socket.send(JSON.stringify({ content, id }))
              }
            } catch (error) {
              console.log('🚀 ~ file: index.js:43 ~ postOpenAi ~ dataArr:', JSON.stringify(dataArr))
              console.log('错误数据：', v)
              const data = sendData()
              data.msg = 'DONE'
              data.id = id
              socket.send(JSON.stringify(data))
              messages.push({ role: 'assistant', content: rep })
              resolve(rep)
            }
          })
        })
      })
      .catch((er) => {
        console.log(er.response.data)
        resolve('回复失败')
      })
  })
}
