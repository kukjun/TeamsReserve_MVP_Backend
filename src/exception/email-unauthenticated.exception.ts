import {
    UnauthorizedException, 
} from "./http/unauthorized.exception";

export class EmailUnauthenticatedException extends UnauthorizedException {
    constructor() {
        super("Email");
    }
}