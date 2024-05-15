import {
    Space,
} from "@prisma/client";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export class SpaceEntity implements Space {
    constructor(dto: Partial<SpaceEntity>) {
        Object.assign(this, dto);
    }
    
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    location: string;
    @ApiProperty({
        required: false,
        nullable: true,
    })
    description: string | null;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    lastModifiedTime: Date;

}