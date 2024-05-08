import {
    ApiProperty,
} from "@nestjs/swagger";

export class DefaultResponse<T> {
    // TODO: Custom Decorator 작업이 필용함. 제네릭으로 선언하는 값을 읽을 수 있도록
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