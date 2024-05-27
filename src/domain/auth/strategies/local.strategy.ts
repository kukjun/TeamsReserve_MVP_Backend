import {
    Injectable,
} from "@nestjs/common";
import {
    PassportStrategy,
} from "@nestjs/passport";
import {
    Strategy,
} from "passport-local";
import {
    AuthService, 
} from "@auth/auth.service";

export const LOCAL_STRATEGY: string = "local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY) {
    constructor(private authService: AuthService) {
        super({
            usernameField: "email",
            passwordField: "password",
        });
    }

    async validate(email: string, password: string): Promise<{ id: string }> {
        return {
            id: await this.authService.validateSignin({
                email,
                password,
            }),
        };
    }
}