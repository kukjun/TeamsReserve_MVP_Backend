export class ErrorData {
    constructor(
        readonly status: number,
        readonly error: string,
        readonly path: string,
        readonly message: string
    ) {
    }

}