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
import {
    PaginateData,
} from "../../../interface/response/paginate.data";
import {
    getMemberListDetailFixture,
    getMemberListFixture,
} from "./fixture/paginate.response";
import {
    PaginateRequestDto,
} from "../../../interface/request/paginate.request.dto";
import {
    UpdateMemberRequestDto,
} from "../dto/req/update-member.request.dto";
import {
    UpdateMemberResponseDto,
} from "../dto/res/update-member.response.dto";
import {
    uuidFunction,
} from "../../../util/function/uuid.function";
import {
    MemberToken,
} from "../../../interface/member-token";
import {
    MemberAuthority,
} from "../../../types/enums/member.authority.enum";
import {
    UpdateMemberPasswordRequestDto, 
} from "../dto/req/update-member-password.request.dto";
import {
    UpdateMemberJoinStatusRequestDto,
} from "../dto/req/update-member-join-status-request.dto";
import {
    UpdateMemberAuthorityRequestDto, 
} from "../dto/req/update-member-authority.request.dto";

const mockMemberService = {
    getMember: jest.fn(),
    getMemberList: jest.fn(),
    updateMember: jest.fn(),
    updateMemberPassword: jest.fn(),
    updateMemberJoinStatus: jest.fn(),
    updateMemberAuthority: jest.fn(),
};
describe("MemberController Unit Test", () => {
    let memberController: MemberController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MemberController,],
            providers: [
                {
                    provide: MemberService,
                    useValue: mockMemberService,
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
            } catch (error) {
                // then
                expect(error instanceof MemberNotFoundException).toBe(true);
            }
        });
    });

    describe("getMemberList", () => {
        it("member Dto 배열과 paginate된 결과를 반환한다.", async () => {
            // given
            const paginateDto: PaginateRequestDto = {
                page: 1,
                limit: 10,
            };
            const expectedResponse: PaginateData<GetMemberResponseDto> = getMemberListFixture;
            mockMemberService.getMemberList.mockResolvedValue(expectedResponse);

            // when
            const response = await memberController.getMemberList(paginateDto);

            // then
            expect(response.data.meta).toBe(expectedResponse.meta);
            expect(response.data.data[0].id).toBe(expectedResponse.data[0].id);
        });
    });

    describe("getMemberList", () => {
        it("member detail Dto 배열과 paginate된 결과를 반환한다.", async () => {
            // given
            const paginateDto: PaginateRequestDto = {
                page: 1,
                limit: 10,
            };
            const expectedResponse: PaginateData<GetMemberResponseDto> = getMemberListDetailFixture;
            mockMemberService.getMemberList.mockResolvedValue(expectedResponse);

            // when
            const response = await memberController.getMemberList(paginateDto);

            // then
            expect(response.data.meta).toBe(expectedResponse.meta);
            expect(response.data.data[0].id).toBe(expectedResponse.data[0].id);
        });
    });

    describe("updateMember", () => {
        it("변환된 결과의 id를 반환한다.", async () => {
            // given
            const expectedNickname = "unitTestNickname";
            const requestBody: UpdateMemberRequestDto = {
                nickname: expectedNickname,
                introduce: "unit test 진행중입니다.",
            };
            const expectedId = uuidFunction.v4();
            const expectedResult: UpdateMemberResponseDto = {
                id: expectedId,
            };
            const token: MemberToken = {
                id: expectedId,
                nickname: expectedNickname,
                authority: MemberAuthority.USER,
            };
            mockMemberService.updateMember.mockResolvedValue(expectedResult);

            // when
            const response = await memberController.updateMember(expectedId, requestBody, token);

            // then
            expect(response.data.id).toBe(expectedId);

        });
    });

    describe("updateMemberPassword", () => {
        it("변환된 결과의 id를 반환한다.", async () => {
            // given
            const expectedNickname = "unitTestNickname";
            const requestBody: UpdateMemberPasswordRequestDto = {
                currentPassword: "currentPassword",
                newPassword: "newPassword",
            };
            const expectedId = uuidFunction.v4();
            const expectedResult: UpdateMemberResponseDto = {
                id: expectedId,
            };
            const token: MemberToken = {
                id: expectedId,
                nickname: expectedNickname,
                authority: MemberAuthority.USER,
            };
            mockMemberService.updateMemberPassword.mockResolvedValue(expectedResult);

            // when
            const response = await memberController.updateMemberPassword(expectedId, requestBody, token);

            // then
            expect(response.data.id).toBe(expectedId);
        });
    });

    describe("updateMemberJoinStatus", () => {
        it("변환된 결과의 id를 반환한다.", async () => {
            // given
            const expectedNickname = "unitTestNickname";
            const requestBody: UpdateMemberJoinStatusRequestDto = {
                joinStatus: true,
            };
            const expectedId = uuidFunction.v4();
            const expectedResult: UpdateMemberResponseDto = {
                id: expectedId,
            };
            const token: MemberToken = {
                id: expectedId,
                nickname: expectedNickname,
                authority: MemberAuthority.ADMIN,
            };
            mockMemberService.updateMemberJoinStatus.mockResolvedValue(expectedResult);

            // when
            const response = await memberController.updateMemberJoinStatus(expectedId, requestBody, token);

            // then
            expect(response.data.id).toBe(expectedId);
        });
    });

    describe("updateMemberJoinStatus", () => {
        it("변환된 결과의 id를 반환한다.", async () => {
            // given
            const expectedNickname = "unitTestNickname";
            const requestBody: UpdateMemberAuthorityRequestDto = {
                authority: MemberAuthority.USER,
            };
            const expectedId = uuidFunction.v4();
            const expectedResult: UpdateMemberResponseDto = {
                id: expectedId,
            };
            const token: MemberToken = {
                id: expectedId,
                nickname: expectedNickname,
                authority: MemberAuthority.ADMIN,
            };
            mockMemberService.updateMemberAuthority.mockResolvedValue(expectedResult);

            // when
            const response = await memberController.updateMemberAuthority(expectedId, requestBody, token);

            // then
            expect(response.data.id).toBe(expectedId);
        });
    });
});