import {
    faker,
} from "@faker-js/faker";
import {
    SigninRequest,
} from "@auth/dto/req/signin.request";

export const signinRequestFixture = (
    email: string = faker.internet.email(),
    password: string = faker.internet.password()
): SigninRequest => {
    return {
        email,
        password,
    };
};