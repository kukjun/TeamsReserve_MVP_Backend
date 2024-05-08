import {
    BadRequestException, 
} from "./http/bad-request.exception";

export class DuplicateException extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}