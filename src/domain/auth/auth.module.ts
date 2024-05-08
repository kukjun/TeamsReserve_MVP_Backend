import {
    Module, 
} from "@nestjs/common";
import {
    AuthController, 
} from "./auth.controller";
import {
    AuthService, 
} from "./auth.service";
import {
    EmailTransferService, 
} from "./email-transfer.service";

@Module({
    imports: [],
    controllers: [AuthController,],
    providers: [AuthService,
        EmailTransferService,],
    exports: [],
})
export class AuthModule {}