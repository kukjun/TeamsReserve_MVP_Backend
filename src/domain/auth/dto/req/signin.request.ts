import {
    IsEmail, IsNotEmpty,
} from "class-validator";

export class SigninRequest {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
    @IsNotEmpty()
    password!: string;
}