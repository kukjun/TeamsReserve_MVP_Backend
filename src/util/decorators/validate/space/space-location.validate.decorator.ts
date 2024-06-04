import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, MaxLength,
} from "class-validator";

export const SpaceLocationValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty({
            message: "Space Location은 꼭 입력해야 합니다.",
        }),
        MaxLength(50, {
            message: "Space Location은 50글자를 초과할 수 없습니다.",
        })
    );
};