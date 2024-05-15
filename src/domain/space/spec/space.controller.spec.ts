import {
    SpaceController, 
} from "../space.controller";
import {
    SpaceService, 
} from "../space.service";
import {
    Test, 
} from "@nestjs/testing";
import {
    CreateSpaceResponseDto, 
} from "../dto/res/create-space.response.dto";
import {
    uuidFunction, 
} from "../../../util/function/uuid.function";
import {
    CreateSpaceRequestDto, 
} from "../dto/req/create-space.request.dto";

const mockSpaceService = {
    createSpace: jest.fn(),
};

describe("SpaceController Unit Test", () => {
    let spaceController: SpaceController;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [SpaceController,],
            providers: [
                {
                    provide: SpaceService,
                    useValue: mockSpaceService,
                },
            ],
        }).compile();
        spaceController = module.get(SpaceController);
    });

    it("SpaceController가 정의되어야 한다.", async () => {
        expect(spaceController).toBeDefined();
    });

    describe("createSpace", () => {
        it("space가 생성되면, id를 반환한다.", async () => {
            // given
            const expectedResponse: CreateSpaceResponseDto = {
                id: uuidFunction.v4(),
            };
            const requestBody: CreateSpaceRequestDto ={
                name: "Test Space",
                location: "Test Location",
                description: "Space Description",
            };
            mockSpaceService.createSpace.mockResolvedValue(expectedResponse);
            // when
            const result = await spaceController.createSpace(requestBody);
            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toBe(expectedResponse.id);
        });
    });
});