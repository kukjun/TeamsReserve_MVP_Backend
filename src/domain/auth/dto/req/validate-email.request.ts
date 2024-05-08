import {
    IsEmail, IsNotEmpty, 
} from "class-validator";

export class ValidateEmailRequest {
    @IsNotEmpty()
    @IsEmail()
    email!: string;
}