import {
    UnauthorizedException, 
} from "@root/exception/http/unauthorized.exception";

export class EmailUnauthenticatedException extends UnauthorizedException {
    constructor() {
        super("Email");
    }
}