const { geminiQueue } = require("./services/aiService");

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Adding task 1 (takes 5s)");
  geminiQueue.add(async () => { await delay(5000); return "Task 1 Done"; }, 10000).then(console.log).catch(console.error);
  
  console.log("Adding task 2 (takes 5s)");
  geminiQueue.add(async () => { await delay(5000); return "Task 2 Done"; }, 10000).then(console.log).catch(console.error);

  console.log("Adding task 3 (takes 5s)");
  geminiQueue.add(async () => { await delay(5000); return "Task 3 Done"; }, 10000).then(console.log).catch(console.error);

  console.log("Adding task 4 (timeouts after 2s, but takes 10s)");
  geminiQueue.add(async () => { await delay(10000); return "Task 4 Done"; }, 2000).then(console.log).catch(console.error);
}

run();

