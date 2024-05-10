import {
    ValidateEmailRequest,
} from "../../dto/req/validate-email.request";

export const validateEmailRequestFixture = (): ValidateEmailRequest => {
    return {
        email: "unitTestEmail@naver.com",
    };
};