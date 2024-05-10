import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    Member, 
} from "@prisma/client";

export class MemberEntity implements Member {
    constructor(dto: Partial<MemberEntity>) {
        Object.assign(this, dto);
    }

    @ApiProperty()
    id: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    nickname: string;
    @ApiProperty({
        required: false,
        nullable: true, 
    })
    introduce: string | null;
    @ApiProperty()
    teamCode: string;
    @ApiProperty()
    joinStatus: boolean;
    @ApiProperty()
    authority: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    lastModifiedTime: Date;

}