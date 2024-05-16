import {
    Photo, 
} from "@prisma/client";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class PhotoEntity implements Photo {
    constructor(dto: Partial<PhotoEntity>) {
        Object.assign(this, dto);
    }
    @ApiProperty()
    id: string;
    @ApiProperty()
    path: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    spaceId: string;
}