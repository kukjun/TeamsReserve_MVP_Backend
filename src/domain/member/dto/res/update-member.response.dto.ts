import {
    ApiProperty, 
} from "@nestjs/swagger";

export class UpdateMemberResponseDto {
    @ApiProperty({
        type: String,
        description: "Member id",
        required: true,
        example: "ebbadaa0-8361-448b-93bc-c6f3b6d0c142",
    })
    id: string;
}