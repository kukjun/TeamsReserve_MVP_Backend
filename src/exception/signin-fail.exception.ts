import {
    BadRequestException, 
} from "./http/bad-request.exception";

export class SigninFailException extends BadRequestException {
    constructor() {
        super("Signin Fail");
    }
}