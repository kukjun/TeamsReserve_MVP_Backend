export class PaginateData<T> {
    data: T[];
    meta: {
        page: number;
        take: number;
        totalCount: number;
        totalPage: number;
        hasNextPage: boolean,
    };
}