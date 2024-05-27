import {
    ExecutionContext,
    Injectable,
} from "@nestjs/common";
import {
    AuthGuard,
} from "@nestjs/passport";
import {
    Reflector,
} from "@nestjs/core";
import {
    Observable,
} from "rxjs";
import {
    MemberAuthority, 
} from "@root/types/enums/member.authority.enum";
import {
    ROLES_KEY, 
} from "@root/util/decorators/permission.decorator";
import {
    MemberUnauthorizedException, 
} from "@root/exception/member-unauthorized.exception";
import {
    JwtAuthFailException, 
} from "@root/exception/jwt-auth-fail.exception";
import {
    JWT_STRATEGY, 
} from "@auth/strategies/jwt.strategy";

@Injectable()
export class JwtGuard extends AuthGuard(JWT_STRATEGY) {
    constructor(private readonly reflector: Reflector) {
        super();
    }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        if (err || !user) {
            throw new JwtAuthFailException();
        }

        const requiredRoles = this.reflector.getAllAndOverride<MemberAuthority[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            throw new MemberUnauthorizedException("Required Role");
        }

        const hasPermission = requiredRoles.some((authority) => user.authority === authority);
        if(!hasPermission) {
            throw new MemberUnauthorizedException(user.authority);
        }

        return user;
    }

}