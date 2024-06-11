import {
    applyDecorators, Type, 
} from "@nestjs/common";
import {
    ApiExtraModels, ApiResponse, getSchemaPath, 
} from "@nestjs/swagger";
import {
    CustomResponse, 
} from "@root/interface/response/custom-response";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";

export const ApiCustomFilterResponseDecorator = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(CustomResponse, PaginateData, model),
        ApiResponse({
            schema: {
                allOf: [
                    {
                        $ref: getSchemaPath(CustomResponse),
                    },
                    {
                        properties: {
                            data: {
                                allOf: [
                                    {
                                        $ref: getSchemaPath(PaginateData),
                                    },
                                    {
                                        properties: {
                                            data: {
                                                type: "array",
                                                items: {
                                                    $ref: getSchemaPath(model),
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        })
    );
};
