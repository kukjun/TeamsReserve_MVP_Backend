import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "../../config/prisma/prisma.service";
import {
    PhotoEntity, 
} from "./entity/photo.entity";

@Injectable()
export class PhotoRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) {
    }

    async save(photoEntity: PhotoEntity): Promise<string> {
        const photo = await this.prismaService.photo.create(({
            data: photoEntity,
        }));

        return photo.id;
    }

    async findPhotoListBySpaceId(id: string): Promise<PhotoEntity[]> {
        const photoList = await this.prismaService.photo.findMany({
            where: {
                spaceId: id,
            },
        });

        return photoList;
    }

    async findPhotoById(id: string): Promise<PhotoEntity | null> {
        const photo = await this.prismaService.photo.findUnique({
            where:{
                id,
            },
        });

        return photo;
    }
    async deletePhotoById(id: string): Promise<null> {
        await this.prismaService.photo.delete({
            where:{
                id,
            },
        });

        return null;
    }

}