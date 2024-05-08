export class DefaultResponse<T> {
    constructor(
        readonly date: T,
        readonly timestamp: string = new Date().toISOString()
    ) {
    }
}