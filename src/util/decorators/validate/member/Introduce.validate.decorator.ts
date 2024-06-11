import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsOptional, IsString, MaxLength, 
} from "class-validator";

export const IntroduceValidateDecorator = () => {
    return applyDecorators(
        IsOptional(),
        IsString({
            message: "소개는 문자열이어야 합니다.",
        }),
        MaxLength(100, {
            message: "소개는 100자 이상 작성할 수 없습니다.",
        }),
    );
};