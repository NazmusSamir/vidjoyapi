import Redis from "ioredis"

export const client = new Redis("rediss://default:38130b08159b4caca095767ac25891e4@immortal-amoeba-48047.upstash.io:48047");
// await client.set('foo', 'bar');