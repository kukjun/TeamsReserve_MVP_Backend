import {
    UnauthorizedException, 
} from "./http/unauthorized.exception";

export class EmailUnauthorizedException extends UnauthorizedException {
    constructor(message: string) {
        super(message);
    }
}