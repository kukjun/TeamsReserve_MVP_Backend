import {
    Reserve,
} from "@prisma/client";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class ReserveEntity implements Reserve {
    constructor(dto: Partial<ReserveEntity>) {
        Object.assign(this, dto);
    }
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly startTime: Date;
    @ApiProperty()
    readonly endTime: Date;
    @ApiProperty({
        required: false,
        nullable: true,
    })
    readonly description: string | null;
    @ApiProperty()
    readonly createdAt: Date;
    @ApiProperty()
    readonly lastModifiedTime: Date;

    @ApiProperty()
    readonly spaceId: string;

    @ApiProperty()
    readonly memberId: string;

}