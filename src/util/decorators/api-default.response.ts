import {
    applyDecorators,
    Type,
} from "@nestjs/common";
import {
    ApiExtraModels, ApiResponse, getSchemaPath,
} from "@nestjs/swagger";
import {
    DefaultResponse, 
} from "../../response/default.response";

export const ApiDefaultResponse = <TModel extends Type<any>>(model: TModel) => {
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