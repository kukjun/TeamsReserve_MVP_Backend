import {
    Module, 
} from "@nestjs/common";
import {
    SpaceController, 
} from "./space.controller";
import {
    SpaceService, 
} from "./space.service";
import {
    SpaceRepository, 
} from "./space.repository";
import {
    PhotoRepository, 
} from "./photo.repository";
import {
    PrismaModule, 
} from "../../config/prisma/prisma.module";

@Module({
    imports:[PrismaModule,],
    controllers:[SpaceController,],
    providers: [SpaceService,
        SpaceRepository,
        PhotoRepository,],
    exports:[SpaceRepository,],
})
export class SpaceModule {}