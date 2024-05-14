import {
    PostgreSqlContainer, StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

import {
    exec,
} from "child_process";
import {
    promisify,
} from "util";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";

const execAsync = promisify(exec);

/**
 * postgresql testContainer Starter
 */
export const psqlTestContainerStarter = async(): Promise<{
    container: StartedPostgreSqlContainer,
    service: PrismaService

}> => {
    const container = await new PostgreSqlContainer().start();
    const config = {
        host: container.getHost(),
        port: container.getMappedPort(5432),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
    };

    // Container 가 가지는 db 주소를 반환
    const databaseUrl = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

    // 스크립트 실행을 통해 DB Container에 우리가 지정한 prisma model로 migrate 진행
    await execAsync(
        `DATABASE_URL=${databaseUrl} npx prisma migrate deploy --preview-feature`
    );

    const service = new PrismaService({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

    return {
        container,
        service,
    };
}
;