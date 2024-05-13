import {
    RedisContainer,
    StartedRedisContainer,
} from "@testcontainers/redis";
import {
    DynamicModule, 
} from "@nestjs/common";
import {
    RedisModule, 
} from "@liaoliaots/nestjs-redis";

export const redisTestContainerStarter = async (): Promise<{
    container: StartedRedisContainer,
    module: DynamicModule
}> => {
    const container = await new RedisContainer().start();
    const module = RedisModule.forRoot({
        readyLog: true,
        config: {
            host: container.getHost(),
            port: container.getPort(),
        },
    });

    return {
        container,
        module,
    };
};