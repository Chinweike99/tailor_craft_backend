import { RateLimitError } from "../utils/error.utils"
import RedisStore from 'rate-limit-redis';
import redisClient from "./redis.middleware";
import rateLimit from "express-rate-limit";
// import { Command } from "ioredis";


const windowMs = 15 * 60 * 1000 // 15 minutes

export const rateLimiter = rateLimit({
    windowMs,
    max: 100,
    handler: (req, res, next) => {
        next(new RateLimitError())
    },
    store: new RedisStore({
        sendCommand: (...args: [string, ...string[]]) => redisClient.call(args[0], ...args.slice(1)) as any,
        prefix: 'rate-limiter',
    })
});


export const authRateLimiter = rateLimit({
  windowMs,
  max: 15,
  handler: (req, res, next) => {
    next(new RateLimitError());
  },
  store: new RedisStore({
    sendCommand: (...args: [string, ...string[]]) => redisClient.call(args[0], ...args.slice(1)) as any,
    prefix: 'auth_rate_limit:',
  }),
});



