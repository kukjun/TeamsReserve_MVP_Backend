import {
    UnauthorizedException, 
} from "./http/unauthorized.exception";

export class TeamUnauthorizedException extends UnauthorizedException {
    constructor() {
        super("Team Code");
    }
}