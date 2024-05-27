import {
    NotFoundException, 
} from "@root/exception/http/not-found.exception";

export class MemberNotFoundException extends NotFoundException {
    constructor(message: string) {
        super(message + " Member");
    }
}