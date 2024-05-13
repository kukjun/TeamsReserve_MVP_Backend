import {
    ApiProperty,
} from "@nestjs/swagger";

export class DefaultResponse<T> {
    readonly data: T;

    @ApiProperty({
        type: String,
        description: "응답 생성 시간",
        example: "2024-05-13T07:55:11.441Z",
    })
    readonly timestamp: string;

    constructor(
        data: T,
        timestamp: string = new Date().toISOString()
    ) {
        this.data = data;
        this.timestamp = timestamp;
    }
}