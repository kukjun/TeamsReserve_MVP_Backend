import {
    applyDecorators,
    Type,
} from "@nestjs/common";
import {
    ApiExtraModels, ApiResponse, getSchemaPath,
} from "@nestjs/swagger";
import {
    DefaultResponse, 
} from "../../interface/response/default.response";

export const ApiDefaultResponseDecorator = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(DefaultResponse, model),
        ApiResponse({
            schema: {
                allOf: [
                    {
                        $ref: getSchemaPath(DefaultResponse),
                    },
                    {
                        properties: {
                            data: {
                                $ref: getSchemaPath(model),
                            },
                        },
                    },
                ],
            },
        })

    );
};