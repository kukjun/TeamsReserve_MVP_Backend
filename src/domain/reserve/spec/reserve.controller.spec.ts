import {
    Test,
} from "@nestjs/testing";
import {
    ReserveController,
} from "../reserve.controller";
import {
    ReserveService,
} from "../reserve.service";
import {
    CreateReserveResponseDto,
} from "../dto/res/create-reserve.response.dto";
import {
    uuidFunction,
} from "../../../util/function/uuid.function";
import {
    CreateReserveValidateRequestDto,
} from "../dto/req/create-reserve-validate.request.dto";

const mockReserveService = {
    createReserve: jest.fn(),
    deleteReserve: jest.fn(),
};

describe("ReserveController Unit Test", () => {
    let reserveController: ReserveController;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [ReserveController,],
            providers: [{
                provide: ReserveService,
                useValue: mockReserveService,
            },],
        }).compile();
        reserveController = module.get(ReserveController);
    });

    it("ReserveController가 정의 되어야 한다.", () => {
        expect(reserveController).toBeDefined();
    });

    describe("createReserve", () => {
        it("reserve를 생성하고 id를 반환해야 한다.", async () => {
            // given
            const expectedResponse: CreateReserveResponseDto = {
                id: uuidFunction.v4(),
            };
            const requestBody: CreateReserveValidateRequestDto = {
                memberId: uuidFunction.v4(),
                spaceId: uuidFunction.v4(),
                startTime: new Date("2023-03-01T10:00"),
                endTime: new Date("2023-03-01T10:00"),
                description: "Unit Test",
            };
            const mockReq = {};
            mockReserveService.createReserve.mockResolvedValue(expectedResponse);

            // when
            const result = await reserveController.createReserve(requestBody, mockReq);
            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toBe(expectedResponse.id);
        });
    });

    describe("deleteReserve", () => {
        it("reserve를 삭제하고 null값을 반환한다.", async () => {
            // given
            const requestParam = uuidFunction.v4();
            const mockReq = {};
            mockReserveService.deleteReserve.mockResolvedValue(requestParam);

            // when
            const result = await reserveController.deleteReserve(requestParam, mockReq);
            // then
            expect(result.data).toBeNull();
        });
    });
});