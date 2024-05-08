export class ConfirmEmailRequest {
    constructor(
        readonly email: string,
        readonly code: string,
    ) {
    }
}