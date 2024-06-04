import {
    applyDecorators, 
} from "@nestjs/common";
import {
    ApiProperty, 
} from "@nestjs/swagger";

export const IntroduceSwaggerDecorator = () => {
    return applyDecorators(
        ApiProperty({
            type: String,
            description: "자기 소개",
            required: false,
            example: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
        })
    );
};