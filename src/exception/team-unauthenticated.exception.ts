import {
    UnauthorizedException, 
} from "@root/exception/http/unauthorized.exception";

export class TeamUnauthenticatedException extends UnauthorizedException {
    constructor() {
        super("Team Code");
    }
}