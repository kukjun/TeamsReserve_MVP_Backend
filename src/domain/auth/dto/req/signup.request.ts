import {
    MemberEntity,
} from "../../../member/entity/member.entity";
import {
    IsEmail, IsNotEmpty, IsString, MaxLength, MinLength,
} from "class-validator";

export class SignupRequest implements Pick<MemberEntity, "email" | "password" | "nickname" | "teamCode"> {
    @IsEmail()
    email!: string;
    // TODO: Password Validate 작업 필요
    password!: string;
    @MinLength(3)
    @MaxLength(10)
    @IsNotEmpty()
    nickname!: string;
    @IsNotEmpty()
    teamCode!: string;
    introduce?: string;
}