import {
    MemberEntity,
} from "@member/entity/member.entity";
import {
    IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength,
} from "class-validator";
import {
    IntroduceSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/introduce.swagger.decorator";
import {
    EmailSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/email.swagger.decorator";
import {
    PasswordSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/password.swagger.decorator";
import {
    NicknameSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/nickname.swagger.decorator";
import {
    TeamCodeSwaggerDecorator, 
} from "@root/util/decorators/swagger/member/team-code.swagger.decorator";

export class SignupRequest implements Pick<MemberEntity, "email" | "password" | "nickname" | "teamCode"> {

    @EmailSwaggerDecorator()
    @IsEmail()
    email!: string;

    @PasswordSwaggerDecorator()
    @IsNotEmpty()
    password!: string;

    @NicknameSwaggerDecorator()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    nickname!: string;

    @TeamCodeSwaggerDecorator()
    @IsNotEmpty()
    teamCode!: string;

    @IntroduceSwaggerDecorator()
    @IsOptional()
    introduce?: string;
}