import {
    BadRequestException, 
} from "@root/exception/http/bad-request.exception";

export class SigninFailException extends BadRequestException {
    constructor() {
        super("Signin Fail");
    }
}