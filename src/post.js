// const https = require('https');
import https from 'https';
const API_KEY = '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'; // 替换成你自己的API Key
const API_ENDPOINT = 'api.openai.com';
const API_PATH = '/v1/chat/completions';

const data = JSON.stringify({
    prompt: 'Hello, my name is ',
    temperature: 0.5,
    max_tokens: 5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
});

const options = {
    hostname: API_ENDPOINT,
    port: 443,
    path: API_PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${API_KEY}`
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
        // process.stdout.write(d);
        console.log("🚀 ~ file: post.js:34 ~ req ~ d:", d)
    });
});

// req.on('error', error => {
//   console.error(error);
// });

// req.write(data);
// req.end();
