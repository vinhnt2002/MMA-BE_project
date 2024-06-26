import { Redis } from "ioredis";
require("dotenv").config();

const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log('Redis Connect');
        return process.env.REDIS_URL
    }
    throw new Error(`Redis connect fail`)
}

export const redis = new Redis(redisClient(), {tls: {
    rejectUnauthorized: false,
}})