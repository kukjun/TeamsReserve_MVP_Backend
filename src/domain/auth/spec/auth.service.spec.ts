// import {
//     AuthService,
// } from "../auth.service";
// import {
//     Test, TestingModule,
// } from "@nestjs/testing";
// import {
//     MemberRepository,
// } from "../../member/repository/member.repository";
// import {
//     JwtService,
// } from "@nestjs/jwt";
// import Redis from "ioredis";
// import {
//     ConfigService,
// } from "@nestjs/config";
//
// const mockMemberRepository = {
//     findMemberByEmail: jest.fn(),
//     findMemberByNickname: jest.fn(),
//     saveMember: jest.fn(),
// };
// const mockJwtService = {
//     sign: jest.fn(),
// };
//
// const mockConfigService = {
//     get: jest.fn(),
// };
//
// describe("authService Unit Test", () => {
//     let authService: AuthService;
//
//     beforeAll(async () => {
//         const mockRedis = {
//             get: jest.fn(),
//         };
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 AuthService,
//                 {
//                     provide: MemberRepository,
//                     useValue: mockMemberRepository,
//                 },
//                 {
//                     provide: JwtService,
//                     useValue: mockJwtService,
//                 },
//                 {
//                     provide: Redis,
//                     useValue: mockRedis,
//                 },
//
//                 {
//                     provide: ConfigService,
//                     useValue: mockConfigService,
//                 },
//             ],
//         }).compile();
//         authService = module.get(AuthService);
//     });
//
//     it("AuthService가 정의 되어야 한다.", async () => {
//         expect(authService).toBeDefined();
//     });
// });