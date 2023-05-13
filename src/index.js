import dotenv from "dotenv";
dotenv.config();
const wss = new Map();
import axios from "axios";
console.log(process.env.OPENAI_API_KEY);

const postOpenAi = (request, socket, messages, id) => {
  let rep = "";
  messages.push({ role: "user", content: request });
  const l = messages.length;
  if (l >= 7) {
    messages.splice(1, l - 4);
  }
  const instance = new AbortController();
  axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo-0301",
        messages,
        temperature: 0,
        stream: true,
        n: 1,
        user: "user",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
        signal: instance.signal,
      }
    )
    .then((response) => {
      response.data.on("data", (chunk) => {
        if (socket.shouldStop) {
          instance.abort();
          console.log("已取消此次回复", new Date().toLocaleTimeString());
        }
        const dataStr = chunk.toString();
        const dataArr = dataStr.split("\n").filter((item) => item);
        dataArr.forEach((v) => {
          try {
            const item = JSON.parse(v.slice(6));
            if (item.choices.finish_reason === "stop") {
              console.log(
                "🚀 ~ file: index.js:48 ~ postOpenAi ~ item.choices.finish_reason:",
                item.choices.finish_reason
              );
              const data = sendData();
              data.id = id;
              data.msg = "DONE";
              socket.send(JSON.stringify(data));
              messages.push({ role: "assistant", content: rep });
            } else {
              const content = item.choices[0].delta.content;
              if (!!!content) {
                return;
              }
              rep += content;
              socket.send(JSON.stringify({ content, id }));
            }
          } catch (error) {
            console.log(
              "🚀 ~ file: index.js:43 ~ postOpenAi ~ dataArr:",
              JSON.stringify(dataArr)
            );
            console.log("错误数据：", v);
            const data = sendData();
            data.msg = "DONE";
            data.id = id;
            socket.send(JSON.stringify(data));
            messages.push({ role: "assistant", content: rep });
          }
        });
      });
    })
    .catch((er) => {
      console.log(er.response.data);
    });
};

import WebSocket, { WebSocketServer } from "ws";
const server = new WebSocketServer({ port: 8088 });
// const server = {};
const sendData = (msg = "连接成功") => {
  return {
    code: 0,
    id: 0,
    msg,
    time: new Date().getTime() / 1000,
  };
};
server.on("connection", (socket, req) => {
  const sessionId = req.url.split("=")[3];
  console.log("链接成功", new Date().toLocaleString());
  let messages = [
    { role: "system", content: "You are a professional front end assistant." },
  ];
  if (wss.has(sessionId)) {
    let userWss = wss.get(sessionId);
    messages = userWss.messages;
  } else {
    wss.set(sessionId, { socket, messages });
  }
  socket.send(JSON.stringify(sendData()));

  socket.on("message", (message) => {
    const reserver = message.toString();
    if (reserver === "ping") {
      // console.log(`Received message: ${reserver}`);
    } else {
      const resData = JSON.parse(reserver);
      postOpenAi(resData.req, socket, messages, resData.index);
    }
  });
  socket.on("close", () => {
    console.log(
      "Client disconnected",
      "time:" + new Date().toLocaleTimeString()
    );
    socket.shouldStop = true;
    wss.delete(sessionId);
  });
});

server.on("error", (err) => {
  console.log("errr", new Date().toLocaleTimeString());
  console.log("🚀 ~ file: index.js:120 ~ server.on ~ err:", err);
});
