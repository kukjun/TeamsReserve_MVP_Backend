import {
    HttpException, HttpStatus,
} from "@nestjs/common";

export class ConflictException extends HttpException {
    constructor(message: string) {
        super(`${message} CONCLICT`, HttpStatus.CONFLICT);
    }
}