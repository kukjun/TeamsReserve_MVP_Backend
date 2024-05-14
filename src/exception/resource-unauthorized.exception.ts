import {
    ForbiddenException, 
} from "./http/forbidden.exception";

export class ResourceUnauthorizedException extends ForbiddenException {
    constructor() {
        super("Resource Unauthorized");
    }
}