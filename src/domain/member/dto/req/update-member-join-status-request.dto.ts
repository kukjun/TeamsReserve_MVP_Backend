import {
    IsBoolean, IsNotEmpty, 
} from "class-validator";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class UpdateMemberJoinStatusRequestDto {
    @ApiProperty({
        type: Boolean,
        description: "가입여부",
        required: false,
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    joinStatus: boolean;
}