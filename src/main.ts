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
    const options = new DocumentBuilder()
        .setTitle("Teams Reserve MVP Service")
        .setDescription("공간 예약 프로그램의 MVP Version")
        .setVersion("0.0.1")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("apiDocs", app, document);

    await app.listen(3000);
}
bootstrap();
