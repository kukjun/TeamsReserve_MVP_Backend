import {
    MemberEntity, 
} from "../../domain/member/entity/member.entity";
import {
    ApiProperty, 
} from "@nestjs/swagger";
import {
    IsBoolean, IsNotEmpty,
} from "class-validator";
import {
    StringParseBoolean, 
} from "../../util/decorators/query-converter";

export class MemberOptionDto implements Pick<MemberEntity, "joinStatus"> {
    @ApiProperty({
        type: Boolean,
        description: "가입여부",
        required: false,
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    @StringParseBoolean()
    joinStatus: boolean;
}