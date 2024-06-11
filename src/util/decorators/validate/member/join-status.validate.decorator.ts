import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsBoolean, IsNotEmpty, 
} from "class-validator";

export const JoinStatusValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty({
            message: "Join Status 값은 비어있으면 안됩니다.",
        }),
        IsBoolean({
            message: "Join Status 값은 Boolean값이 들어와야 합니다.",
        })
    );
};