import {
    applyDecorators, 
} from "@nestjs/common";
import {
    IsNotEmpty, IsString, Matches, 
} from "class-validator";

export const PasswordValidateDecorator = () => {
    return applyDecorators(
        IsNotEmpty({
            message: "비밀번호는 비어있으면 안됩니다.",
        }),
        IsString({
            message: "비밀번호는 문자열이어야 합니다.",
        }),
        Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#~$*])[A-Za-z\d!@#~$*]{8,20}$/, {
            message: "비밀번호 형식을 지켜주세요. 정규식: /^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#~$*])[A-Za-z\\d!@#~$*]{8,20}$/",
        }),
    );
};