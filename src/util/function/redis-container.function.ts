import {
    RedisContainer, StartedRedisContainer, 
} from "@testcontainers/redis";

export const redisTestContainerStarter = async (): Promise<StartedRedisContainer> => {
    return await new RedisContainer().start();
}
;