import {
    ReserveLog,
} from "@prisma/client";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class ReserveLogEntity implements ReserveLog {
    constructor(dto: Partial<ReserveLogEntity>) {
        Object.assign(this, dto);
    }
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly reservedUser: string;
    @ApiProperty()
    readonly reservedSpaceName: string;
    @ApiProperty()
    readonly reservedLocation: string;
    @ApiProperty()
    readonly reservedTimes: string;
    @ApiProperty()
    readonly state: string;
    @ApiProperty()
    readonly createdAt: Date;
    @ApiProperty()
    readonly lastModifiedTime: Date;

}