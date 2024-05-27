import {
    Injectable, 
} from "@nestjs/common";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    PhotoEntity, 
} from "@space/entity/photo.entity";

@Injectable()
export class PhotoRepository {
    private readonly prismaPhoto: PrismaService["photo"];
    constructor(
        private readonly prismaService: PrismaService
    ) {
        this.prismaPhoto = prismaService.photo;
    }

    async save(photoEntity: PhotoEntity): Promise<string> {
        const photo = await this.prismaPhoto.create(({
            data: photoEntity,
        }));

        return photo.id;
    }

    async findPhotoListBySpaceId(id: string): Promise<PhotoEntity[]> {
        const photoList = await this.prismaPhoto.findMany({
            where: {
                spaceId: id,
            },
        });

        return photoList;
    }

    async findPhotoById(id: string): Promise<PhotoEntity | null> {
        const photo = await this.prismaPhoto.findUnique({
            where:{
                id,
            },
        });

        return photo;
    }
    async deletePhotoById(id: string): Promise<null> {
        await this.prismaPhoto.delete({
            where:{
                id,
            },
        });

        return null;
    }

}