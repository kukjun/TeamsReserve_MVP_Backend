import {
    BadRequestException, 
} from "@root/exception//http/bad-request.exception";

export class PasswordIncorrectException extends BadRequestException {
    constructor() {
        super("Password Incorrect");
    }
}