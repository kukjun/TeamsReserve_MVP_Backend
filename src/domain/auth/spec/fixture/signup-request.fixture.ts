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
        teamCode: "TEAM_CODE",
        introduce: faker.string.sample({
            min: 100,
            max: 200,
        }),
    };
};