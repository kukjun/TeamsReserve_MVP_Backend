import {
    IsEmail, IsNotEmpty,
} from "class-validator";

export class ConfirmEmailRequest {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
    @IsNotEmpty()
    code!: string;
}