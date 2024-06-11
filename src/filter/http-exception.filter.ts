import {
    ArgumentsHost,
    Catch, ExceptionFilter, HttpException, HttpStatus, Logger,
} from "@nestjs/common";
import {
    Request, Response, 
} from "express";
import {
    ErrorData, 
} from "@root/interface/response/error.data";
import {
    CustomResponse,
} from "@root/interface/response/custom-response";

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
            new CustomResponse(data)
        );
    }
}