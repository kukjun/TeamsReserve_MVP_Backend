import {
    NotFoundException, 
} from "@root/exception/http/not-found.exception";

export class PhotoNotFoundException extends NotFoundException {
    constructor(message: string) {
        super(`${message} Photo`);
    }
}