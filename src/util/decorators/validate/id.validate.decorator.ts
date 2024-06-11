import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, IsUUID,
} from "class-validator";

export const IdValidateDecorator = (value: string) => {
    return applyDecorators(
        IsNotEmpty({
            message: `${value}Id는 꼭 존재해야 합니다.`,
        }),
        IsUUID("all",{
            message: `${value}Id는 uuid 형태이어야 합니다.`,
        })
    );
};