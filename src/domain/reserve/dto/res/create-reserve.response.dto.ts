import {
    ReserveIdSwaggerDecorator, 
} from "@root/util/decorators/swagger/reserve/reserve-id.swagger.decorator";

export class CreateReserveResponseDto {
    @ReserveIdSwaggerDecorator()
    id: string;
}