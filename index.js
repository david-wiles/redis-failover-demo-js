import express from 'express';
import { createClient } from "redis";

const app = express();
const client = createClient({
  url: 'redis://redis_1:6379'
});
client.on('error', err => console.log('redis error', err));

await client.connect();

app.get("/get/:key", async (req, res) => {
  const value = await client.get(req.params.key)
  res.json({value});
});

app.post("/set/:key/:value", async (req, res) => {
  await client.set(req.params.key, req.params.value)
  res.json({});
});

app.listen(9000, () => console.log("listening on port 9000"));
