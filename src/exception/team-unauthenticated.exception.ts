import {
    UnauthorizedException, 
} from "./http/unauthorized.exception";

export class TeamUnauthenticatedException extends UnauthorizedException {
    constructor() {
        super("Team Code");
    }
}