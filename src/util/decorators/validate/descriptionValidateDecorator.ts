import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsOptional, MaxLength, 
} from "class-validator";

export const DescriptionValidateDecorator = () => {
    return applyDecorators(
        IsOptional(),
        MaxLength(100, {
            message: "설명란은 100자를 초과할 수 없습니다.",
        })
    );
};