import {
    ArgumentsHost,
    Catch, ExceptionFilter, HttpException, HttpStatus, Logger,
} from "@nestjs/common";
import {
    ErrorData, 
} from "../response/error.data";
import {
    DefaultResponse, 
} from "../response/default.response";
import {
    Request, Response, 
} from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        let errorMessage: any = exception.getResponse();
        if (typeof errorMessage === "object") {
            errorMessage = errorMessage.message;
        }

        this.logger.error(
            `Error Occur ${request.url} ${request.method}, errorMessage: ${JSON.stringify(errorMessage, null, 2)}`
        );

        const data = new ErrorData(status, HttpStatus[status], request.url, errorMessage);

        response.status(status).json(
            new DefaultResponse(data)
        );
    }
}