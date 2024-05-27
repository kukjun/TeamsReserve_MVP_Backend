import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    SpaceEntity, 
} from "@space/entity/space.entity";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";

@Injectable()
export class SpaceRepository {
    private readonly prismaSpace: PrismaService["space"];
    private readonly prismaPhoto: PrismaService["photo"];
    constructor(private readonly prismaService: PrismaService) {
        this.prismaSpace = prismaService.space;
        this.prismaPhoto = prismaService.photo;
    }

    async findSpaceByName(name: string): Promise<SpaceEntity | null> {
        const space = await this.prismaSpace.findUnique({
            where: {
                name,
            },
        });

        return space;
    }

    /**
     * id 조회
     * @param id
     * @param txSpace Interact Transaction을 위한 선택적 주입
     */
    async findSpaceById(
        id: string,
        txSpace?: PrismaService["space"]
    ): Promise<SpaceEntity | null> {
        const prismaClientSpace = txSpace ?? this.prismaSpace;
        const space = await prismaClientSpace.findUnique({
            where: {
                id,
            },
        });

        return space;
    }

    async saveSpace(space: SpaceEntity): Promise<string> {
        const result = await this.prismaSpace.create({
            data: space,
        });

        return result.id;
    }

    async findSpaceByPaging(paginateDto: PaginateRequestDto): Promise<SpaceEntity[]> {
        return await this.prismaSpace.findMany({
            skip: (paginateDto.page - 1) * paginateDto.limit,
            take: paginateDto.limit,
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findSpaceCount(): Promise<number> {
        return await this.prismaSpace.count();
    }

    async updateSpace(space: SpaceEntity): Promise<string> {
        const result = await this.prismaSpace.update({
            where: {
                id: space.id,
            },
            data: space,
        });

        return result.id;
    }

    async deleteSpace(id: string): Promise<null> {
        // HACK: Cascade 전략을 제고
        await this.prismaPhoto.deleteMany({
            where: {
                spaceId: id,
            },
        });
        await this.prismaSpace.delete({
            where: {
                id,
            },
        });

        return null;
    }
}