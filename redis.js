const Redis = require("redis");

const client = Redis.createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

async function setCache(key, value, expire) {
  await client.setEx(key, expire, value);
}

async function getCache(key) {
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

async function deleteCache(key) {
  await client.del(key);
}

module.exports = {
  setCache,
  getCache,
  deleteCache,
};
