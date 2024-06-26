import {
    faker, 
} from "@faker-js/faker";
import {
    SignupRequest, 
} from "@auth/dto/req/signup.request";

export const signupRequestFixture = ():SignupRequest => {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        nickname: faker.internet.displayName(),
        teamCode: faker.number.int({
            min: 100000,
            max: 999999,
        }).toString(),
        introduce: faker.string.sample({
            min: 100,
            max: 200,
        }),
    };
};