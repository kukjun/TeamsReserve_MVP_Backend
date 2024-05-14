import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsNumber,
} from "class-validator";
import {
    Type, 
} from "class-transformer";

export class PaginateRequestDto {
    @ApiProperty({
        type: Number,
        description: "조회하고자 하는 Page",
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number) // 문자열을 숫자로 변환
    page: number;

    @ApiProperty({
        type: Number,
        description: "한 Page 당 갯수",
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number) // 문자열을 숫자로 변환
    limit: number;
}
