import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsNotEmpty, 
} from "class-validator";

export class UpdateMemberPasswordRequestDto {
    // TODO: Password Validate 작업 필요
    @ApiProperty({
        type: String,
        description: "변경 이전의 비밀번호",
        required: true,
        example: "test123!@",
    })
    @IsNotEmpty()
    currentPassword!: string;

    // TODO: Password Validate 작업 필요
    @ApiProperty({
        type: String,
        description: "변경 이후의 비밀번호",
        required: true,
        example: "test123!@",
    })
    @IsNotEmpty()
    newPassword!: string;
}