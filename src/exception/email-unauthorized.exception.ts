import {
    UnauthorizedException, 
} from "./http/unauthorized.exception";

export class EmailUnauthorizedException extends UnauthorizedException {
    constructor() {
        super("Email");
    }
}