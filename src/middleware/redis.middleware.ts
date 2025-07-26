import Redis from 'ioredis';
import config from '../config/config';


const redisClient = new Redis(config.redis.url);

redisClient.on('connect', ()=> {
    console.log("Connected to redis")
});

redisClient.on("error", (error)=> {
    console.error("Redis error:", (error) )
})


export default redisClient;
