import {
    ConfirmEmailRequest, 
} from "../../dto/req/confirm-email.request";

export const confirmEmailRequestFixture = (): ConfirmEmailRequest => {
    return {
        email: "unitTestEmail@naver.com",
        code: "123456",
    };
};