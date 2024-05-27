import {
    ArgumentMetadata, PipeTransform,
} from "@nestjs/common";
import {
    CreateReserveRequestDto, 
} from "@reserve/dto/req/create-reserve.request.dto";
import {
    CreateReserveValidateRequestDto, 
} from "@reserve/dto/req/create-reserve-validate.request.dto";
import {
    BadRequestException, 
} from "@root/exception/http/bad-request.exception";

export class ReserveValidatePipe implements PipeTransform<CreateReserveRequestDto, CreateReserveValidateRequestDto> {
    readonly reserveData = {
        limitStartTimeValue: 60 * 10,
        limitEndTimeValue: 60 * 22,
        limitMinimumReserveTime: 30,
        limitMaximumReserveTime: 60 * 2,
        regex: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):(00|30)$/,

    };

    transform(value: CreateReserveRequestDto, metadata: ArgumentMetadata): CreateReserveValidateRequestDto {
        // 문자열 검사
        if (
            !this.reserveData.regex.test(value.startTime) ||
            !this.reserveData.regex.test(value.endTime)
        ) throw new BadRequestException("Invalidate regex");
        const startDate = new Date(value.startTime);
        const endDate = new Date(value.endTime);
        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())
        ) throw new BadRequestException("Invalidate date structure");

        const [startDateString, startTime,] = value.startTime.split("T");
        const [startHour, startMinute,] = startTime.split(":");
        const [endDateString, endTime,] = value.endTime.split("T");
        const [endHour, endMinute,] = endTime.split(":");

        // 먼저 동일한 날짜여야 함
        if (startDateString !== endDateString) throw new BadRequestException("Invalidate same day");

        // 시간을 분으로 연산
        const startTimeValue: number = +startHour * 60 + +startMinute;
        const endTimeValue: number = +endHour * 60 + +endMinute;

        // 시간 제약 조건 확인
        // 1. 시작, 종료 제한 시간을 넘으면 안됨.
        if (
            startTimeValue < this.reserveData.limitStartTimeValue ||
            endTimeValue > this.reserveData.limitEndTimeValue
        ) throw new BadRequestException("Invalidate start, end time limit");
        // 2. 최소 30분, 최대 120분 예약 가능
        if (
            endTimeValue - startTimeValue < this.reserveData.limitMinimumReserveTime ||
            endTimeValue - startTimeValue > this.reserveData.limitMaximumReserveTime
        ) throw new BadRequestException("Invalidate time min or max");

        return {
            spaceId: value.spaceId,
            memberId: value.memberId,
            startTime: startDate,
            endTime: endDate,
            description: value.description,
        };
    }
}