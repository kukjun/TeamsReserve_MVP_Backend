import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, IsString, Matches, 
} from "class-validator";

export const NicknameValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty({
            message: "닉네임은 비어있으면 안됩니다.",
        }),
        IsString({
            message: "닉네임은 문자열이어야 합니다.",
        }),
        Matches(/^[가-힣a-zA-Z0-9]{2,10}$/, {
            message: "닉네임 형식을 지켜주세요. 정규식: /^[가-힣a-zA-Z0-9]{2,10}$/",
        }),
    );
};