import {
    BadRequestException, 
} from "./http/bad-request.exception";

export class EmailConfirmFailException extends BadRequestException {
    constructor() {
        super("Email Confirm Fail");
    }
}