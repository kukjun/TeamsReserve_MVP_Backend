import {
    ForbiddenException, 
} from "./http/forbidden.exception";

export class MemberUnauthorizedException extends ForbiddenException {
    constructor(message: string) {
        super(message + " Member Unauthorized");
    }
}