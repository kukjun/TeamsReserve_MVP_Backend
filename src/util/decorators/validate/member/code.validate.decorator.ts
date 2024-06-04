import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, Length, 
} from "class-validator";

export const CodeValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty(),
        Length(6,6),
    );
};