import {
    NestFactory, 
} from "@nestjs/core";
import {
    AppModule, 
} from "./app.module";
import {
    HttpExceptionFilter, 
} from "./filter/http-exception.filter";
import {
    ValidationPipe, 
} from "@nestjs/common";
import {
    DocumentBuilder,
    SwaggerModule,
} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, 
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    // TODO: Frontend가 없어, 테스트를 위한 CORS 개방
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ["GET",
            "POST",
            "OPTIONS",
            "PUT",
            "PATCH",
            "DELETE",],
    });
    const options = new DocumentBuilder()
        .setTitle("Teams Reserve MVP Service")
        .setDescription("공간 예약 프로그램의 MVP Version")
        .setVersion("1.0.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                name: "JWT",
                description: "JWT token for Auth",
                in: "header",
            },
            "token",
        )
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("apiDocs", app, document);

    await app.listen(3000);
}
bootstrap();
