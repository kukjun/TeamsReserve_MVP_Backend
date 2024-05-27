import {
    Module, 
} from "@nestjs/common";
import {
    PrismaModule, 
} from "@root/config/prisma/prisma.module";
import {
    SpaceController, 
} from "@space/space.controller";
import {
    SpaceService, 
} from "@space/space.service";
import {
    SpaceRepository, 
} from "@space/space.repository";
import {
    PhotoRepository, 
} from "@space/photo.repository";

@Module({
    imports:[PrismaModule,],
    controllers:[SpaceController,],
    providers: [SpaceService,
        SpaceRepository,
        PhotoRepository,],
    exports:[SpaceRepository,],
})
export class SpaceModule {}