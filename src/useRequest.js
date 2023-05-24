/*
 * @Author: huhaibiao
 * @Date: 2023-05-24 11:38:20
 */
const requestQueue = [] // 存储请求的队列
let processing = false // 标记是否正在处理请求
let tryNums = 6
// let timeLimit = false
// let time = new Date().getTime() // 控制请求速率的定时器
console.log(process.env.NODE_ENV)

export function useProcessRequests(quest, postOpenApi = () => {}, callback, requests, num = 3) {
  requestQueue.push(quest)
  if (requestQueue.length > 3) {
    if (processing) return
  }
  const fn = async (requests) => {
    if (requestQueue.length > 0) {
      processing = true
      requests = requests ? requests : requestQueue.splice(0, num) // 最多同时处理3个请求
      // if (process.env.NODE_ENV === 'dev') postOpenApi = () => Promise.resolve(1)
      return Promise.all(requests.map((item) => postOpenApi(...item)))
        .then((reqs) => {
          tryNums = 6
          callback(reqs)
          if (requestQueue.length <= 3) {
            return fn()
          }
          setTimeout(fn, 1000 * 60 * 2)
        })
        .catch((error) => {
          tryNums--
          if (tryNums > 0) {
            fn(requests)
          }
        })
        .finally(() => {
          if (requestQueue.length === 0) {
            processing = false
          }
        })
    } else {
      processing = false
    }
  }

  return fn()
}
