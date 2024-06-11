import {
    BadRequestException, 
} from "@root/exception/http/bad-request.exception";

export class JwtAuthFailException extends BadRequestException {
    constructor() {
        super("JWT Auth Fail");
    }

}