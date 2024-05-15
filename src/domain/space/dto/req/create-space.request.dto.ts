import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsOptional,
} from "class-validator";
import {
    SpaceEntity, 
} from "../../entity/space.entity";

export class CreateSpaceRequestDto implements Pick<SpaceEntity, "name" | "location"> {
    @ApiProperty({
        type: String,
        description: "공간 이름",
        required: true,
        example: "미래 인재관",
    })
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        type: String,
        description: "공간 위치",
        required: true,
        example: "서울시 용산구 한강대로 41길 21 6층",
    })
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        type: String,
        description: "공간에 대한 설명",
        required: false,
        nullable: true,
        example: "이 공간은 40여명을 수용할 수 있고, 화이트보드가 있습니다.",
    })
    @IsOptional()
    description?: string | null;
}