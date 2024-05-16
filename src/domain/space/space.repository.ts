import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    SpaceEntity, 
} from "./entity/space.entity";

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
}