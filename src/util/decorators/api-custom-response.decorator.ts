import {
    applyDecorators,
    Type,
} from "@nestjs/common";
import {
    ApiExtraModels, ApiResponse, getSchemaPath,
} from "@nestjs/swagger";
import {
    CustomResponse, 
} from "@root/interface/response/custom-response";

export const ApiCustomResponseDecorator = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(CustomResponse, model),
        ApiResponse({
            schema: {
                allOf: [
                    {
                        $ref: getSchemaPath(CustomResponse),
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