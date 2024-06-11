import {
    ForbiddenException, 
} from "@root/exception/http/forbidden.exception";

export class ResourceUnauthorizedException extends ForbiddenException {
    constructor() {
        super("Resource Unauthorized");
    }
}