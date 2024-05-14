import {
    BadRequestException, 
} from "./http/bad-request.exception";

export class PasswordIncorrectException extends BadRequestException {
    constructor() {
        super("Password Incorrect");
    }
}