import {
    BadRequestException, 
} from "@root/exception/http/bad-request.exception";

export class DuplicateException extends BadRequestException {
    constructor(message: string) {
        super(message + " Duplicate");
    }
}