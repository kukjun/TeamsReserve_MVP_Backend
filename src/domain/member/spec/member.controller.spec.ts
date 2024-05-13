import {
    MemberController, 
} from "../member.controller";
import {
    Test,
    TestingModule,
} from "@nestjs/testing";
import {
    MemberService, 
} from "../member.service";
import {
    GetMemberResponseDto, 
} from "../dto/res/get-member.response.dto";
import {
    MemberNotFoundException, 
} from "../../../exception/member-not-found.exception";

const mockMemberService = {
    getMember: jest.fn(),
};
describe("MemberController Unit Test", () => {
    let memberController: MemberController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberController,],
            providers: [
                {
                    provide: MemberService,
                    useValue:mockMemberService,
                },
            ],
        }).compile();
        memberController = module.get(MemberController);
    });

    it("Member Controller가 정의되어야 한다.", async () => {
        expect(memberController).toBeDefined();
    });

    describe("getMember", () => {
        it("존재하는 member의 id로 요청하면, 회원 정보를 반환한다.", async () => {
            // given
            const expectedResponse: GetMemberResponseDto = {
                id: "ebbadaa0-8361-448b-93bc-c6f3b6d0c142",
                email: "test123@naver.com",
                nickname: "테스트 닉네임",
                teamCode: "ABCDEF-001",
                introduce: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
            };
            mockMemberService.getMember.mockResolvedValue(expectedResponse);

            // when
            const result = await memberController.getMember("ebbadaa0-8361-448b-93bc-c6f3b6d0c142");

            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toEqual(expectedResponse.id);
            expect(result.data.email).toEqual(expectedResponse.email);
            expect(result.data.nickname).toEqual(expectedResponse.nickname);
            expect(result.data.teamCode).toEqual(expectedResponse.teamCode);
            expect(result.data.introduce).toEqual(expectedResponse.introduce);
        });

        it("존재하지 않는 유저를 조회하면, 유저를 찾을 수 없다는 예외가 발생한다.", async () => {
            // given
            const expectedResponse: GetMemberResponseDto = {
                id: "ebbadaa0-8361-448b-93bc-c6f3b6d0c142",
                email: "test123@naver.com",
                nickname: "테스트 닉네임",
                teamCode: "ABCDEF-001",
                introduce: "안녕하세요. 지인 소개로 가입하게 되었습니다. 잘부탁드립니다.",
            };
            mockMemberService.getMember.mockImplementation(() => {
                throw new MemberNotFoundException(`id: ${expectedResponse.id}`);
            });

            // when
            try {
                await memberController.getMember("ebbadaa0-8361-448b-93bc-c6f3b6d0c142");
                new Error();
            } catch(error) {
                // then
                expect(error instanceof MemberNotFoundException).toBe(true);
            }
        });
    });
});