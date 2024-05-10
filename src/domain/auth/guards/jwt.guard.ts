import {
    CanActivate, ExecutionContext,
    Injectable,
} from "@nestjs/common";
import {
    AuthGuard,
} from "@nestjs/passport";
import {
    JWT_STRATEGY,
} from "../strategies/jwt.strategy";
import {
    Reflector,
} from "@nestjs/core";
import {
    Observable,
} from "rxjs";
import {
    MemberToken,
} from "../../../interface/member-token";
import {
    MemberAuthority, 
} from "../../../types/enums/member.authority.enum";
import {
    ROLES_KEY, 
} from "../../../util/decorators/permission";
import {
    MemberUnauthorizedException, 
} from "../../../exception/member-unauthorized.exception";

@Injectable()
export class JwtGuard extends AuthGuard(JWT_STRATEGY) implements CanActivate {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<MemberAuthority[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            throw new MemberUnauthorizedException("Required Role");
        }
        const {
            user,
        }: { user: MemberToken } = context.switchToHttp().getRequest();

        const hasPermission = requiredRoles.some((authority) => user.authority === authority);
        if(!hasPermission) {
            throw new MemberUnauthorizedException(user.authority);
        }

        return hasPermission;

    }
}