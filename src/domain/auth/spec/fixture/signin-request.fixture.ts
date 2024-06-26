import {
    faker, 
} from "@faker-js/faker";
import {
    SigninRequest, 
} from "@auth/dto/req/signin.request";

export const signinRequestFixture = ():SigninRequest => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
};