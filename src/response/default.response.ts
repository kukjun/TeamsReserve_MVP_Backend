import {
    ApiProperty,
} from "@nestjs/swagger";

export class DefaultResponse<T> {
    readonly data: T;

    @ApiProperty({
        type: String,
        description: "응답 생성 시간",
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