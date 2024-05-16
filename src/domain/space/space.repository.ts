import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    SpaceEntity, 
} from "./entity/space.entity";
import {
    PaginateRequestDto, 
} from "../../interface/request/paginate.request.dto";

@Injectable()
export class SpaceRepository {
    constructor(private readonly prismaService: PrismaService) {
    }

    async findSpaceByName(name: string): Promise<SpaceEntity | null> {
        const space = await this.prismaService.space.findUnique({
            where: {
                name,
            },
        });

        return space;
    }

    async findSpaceById(id: string): Promise<SpaceEntity | null> {
        const sapce = await this.prismaService.space.findUnique({
            where: {
                id,
            },
        });

        return sapce;
    }

    async saveSpace(space: SpaceEntity): Promise<string> {
        const result = await this.prismaService.space.create({
            data: space,
        });

        return result.id;
    }

    async findSpaceByPaging(paginateDto: PaginateRequestDto): Promise<SpaceEntity[]> {
        return await this.prismaService.space.findMany({
            skip: (paginateDto.page - 1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findSpaceCount(): Promise<number> {
        return await this.prismaService.space.count();
    }

    async updateSpace(space: SpaceEntity): Promise<string> {
        const result = await this.prismaService.space.update({
            where: {
                id: space.id,
            },
            data: space,
        });

        return result.id;
    }

    async deleteSpace(id: string): Promise<null> {
        await this.prismaService.space.delete({
            where: {
                id,
            },
        });

        return null;
    }
}