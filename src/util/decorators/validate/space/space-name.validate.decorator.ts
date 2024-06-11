import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, MaxLength, 
} from "class-validator";

export const SpaceNameValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty({
            message: "Space Name은 꼭 입력해야 합니다.",
        }),
        MaxLength(20, {
            message: "Space Name은 20글자를 초과할 수 없습니다.",
        })
    );
};