import {
    NotFoundException, 
} from "@root/exception/http/not-found.exception";

export class SpaceNotFoundException extends NotFoundException {
    constructor(message: string) {
        super(`${message} Space Not Found`);
    }
}