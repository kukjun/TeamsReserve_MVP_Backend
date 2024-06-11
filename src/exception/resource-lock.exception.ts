import {
    ConflictException, 
} from "@root/exception/http/conflict.exception";

export class ResourceLockException extends ConflictException {
    constructor(message: string) {
        super(`${message} LOCK`);
    }
}