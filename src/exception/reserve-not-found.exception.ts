import {
    NotFoundException, 
} from "@root/exception/http/not-found.exception";

export class ReserveNotFoundException extends NotFoundException {
    constructor(message: string) {
        super(`${message} Reserve`);
    }

}