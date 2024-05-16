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
import {
    GetPhotoListResponseDto,
} from "../dto/res/get-photo-list-response.dto";
import {
    CreatePhotoResponseDto,
} from "../dto/res/create-photo.response.dto";
import {
    GetSpaceResponseDto, 
} from "../dto/res/get-space.response.dto";
import {
    getSpaceList, 
} from "./fixture/paginate.response";
import {
    PaginateRequestDto, 
} from "../../../interface/request/paginate.request.dto";

const mockSpaceService = {
    createSpace: jest.fn(),
    createPhoto: jest.fn(),
    getPhotoList: jest.fn(),
    getSpace: jest.fn(),
    getSpaceList: jest.fn(),
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
            const requestBody: CreateSpaceRequestDto = {
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

    describe("createSpacePhoto", () => {
        it("photo를 생성하면, 저장된 photo id를 반환한다.", async () => {
            // given
            const expectedResponse: CreatePhotoResponseDto = {
                id: uuidFunction.v4(),
            };
            const requestId = uuidFunction.v4();
            const mockingFile: Express.Multer.File = null;
            mockSpaceService.createPhoto.mockResolvedValue(expectedResponse);
            // when
            const result = await spaceController.createSpacePhoto(requestId, mockingFile);
            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toBe(expectedResponse.id);
        });
    });

    describe("getPhotoList", () => {
        it("photo를 조회하고, 결과 dto를 반환할 수 있다.", async () => {
            // given
            const expectedResponse: GetPhotoListResponseDto = {
                data: [{
                    id: uuidFunction.v4(),
                    path: "unit/test/path",
                    name: "unittest.png",
                },],
            };
            const requestId = uuidFunction.v4();
            mockSpaceService.getPhotoList.mockResolvedValue(expectedResponse);
            // when
            const result = await spaceController.getPhotoList(requestId);
            // then
            expect(result).not.toBeNull();
            expect(result.data.data[0].id).toBe(expectedResponse.data[0].id);
        });
    });

    describe("getSpace", () => {
        it("id로 space를 조회할 수 있다.", async() => {
            // given
            const expectedResponse: GetSpaceResponseDto = {
                id: uuidFunction.v4(),
                name: "Test Space",
                location: "Test Location",
                description: "Space Description",
            };
            const requestId = uuidFunction.v4();
            mockSpaceService.getSpace.mockResolvedValue(expectedResponse);
            // when
            const result = await spaceController.getSpace(requestId);
            // then
            expect(result).not.toBeNull();
            expect(result.data.id).toBe(expectedResponse.id);
            expect(result.data.name).toBe(expectedResponse.name);
            expect(result.data.location).toBe(expectedResponse.location);
            expect(result.data.description).toBe(expectedResponse.description);
        });
    });

    describe("getSpaceList", () => {
        it("pagiate된 결과를 받을 수 있다.", async () => {
            // given
            const expectedResponse = getSpaceList;
            const paginateDto: PaginateRequestDto = {
                page: 1,
                limit: 10,
            };
            mockSpaceService.getSpaceList.mockResolvedValue(expectedResponse);
            // when
            const result = await spaceController.getSpaceList(paginateDto);
            // then
            expect(result).not.toBeNull();
            expect(result.data.meta).toBe(expectedResponse.meta);
            expect(result.data.data[0].id).toBe(expectedResponse.data[0].id);
        });
    });

});