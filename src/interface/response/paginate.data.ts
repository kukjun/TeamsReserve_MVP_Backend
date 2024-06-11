import {
    ApiProperty, 
} from "@nestjs/swagger";

export class PaginateData<T> {
    data: T[];

    @ApiProperty({
        type: Object,
        description: "Page Metadata",
        example: {
            page: 1,
            take: 1,
            totalCount: 9,
            totalPage: 1,
            hasNextPage: false,
        },
    })
    meta: {
        page: number;
        take: number;
        totalCount: number;
        totalPage: number;
        hasNextPage: boolean,
    };
}