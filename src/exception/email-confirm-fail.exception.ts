import {
    BadRequestException, 
} from "@root/exception/http/bad-request.exception";

export class EmailConfirmFailException extends BadRequestException {
    constructor() {
        super("Email Confirm Fail");
    }
}