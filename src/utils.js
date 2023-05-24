/*
 * @Author: huhaibiao
 * @Date: 2023-05-23 21:45:56
 */
/**
 *
 * @param {*} data
 * @param {*} code 0 代表初始值， 1 代表当前在线用户数 2 代表问题数 3 代表回复内容
 */
export const sendData = (data = '连接成功', code = 0) => {
  return {
    code,
    id: 0,
    data,
    time: new Date().getTime() / 1000
  }
}
