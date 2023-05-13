/*
 * @Author: huhaibiao huhaibiao@do-global.com
 * @Date: 2023-04-12 19:14:17
 */
import axios from 'axios'
console.log('1ß')

const itRealyFuckedMe = async (input) => {
  try {
    let data = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }]
    }

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer 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`
      },
      data: data,
      proxy: {
        host: 'localhost',
        port: 7890
      }
    }
    let completion = await axios(config)
      .then((response) => {
        console.log('response.data:', JSON.stringify(response.data))
        console.log('1')

        return response.data.choices[0].message
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response)
        console.log('2')
      })

    return completion
  } catch (error) {
    console.log(error)
  }
}
itRealyFuckedMe('你好')
