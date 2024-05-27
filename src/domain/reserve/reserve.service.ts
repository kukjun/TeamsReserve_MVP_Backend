import {
    Injectable,
} from "@nestjs/common";
import {
    InjectRedis,
} from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import {
    ReserveRepository, 
} from "@reserve/reserve.repository";
import {
    ReserveLogRepository, 
} from "@reserve/reserve-log.repository";
import {
    SpaceRepository, 
} from "@space/space.repository";
import {
    MemberRepository, 
} from "@member/member.repository";
import {
    PrismaService, 
} from "@root/config/prisma/prisma.service";
import {
    CreateReserveValidateRequestDto, 
} from "@reserve/dto/req/create-reserve-validate.request.dto";
import {
    MemberToken, 
} from "@root/interface/member-token";
import {
    CreateReserveResponseDto, 
} from "@reserve/dto/res/create-reserve.response.dto";
import {
    ResourceUnauthorizedException, 
} from "@root/exception/resource-unauthorized.exception";
import {
    ResourceLockException, 
} from "@root/exception/resource-lock.exception";
import {
    MemberNotFoundException, 
} from "@root/exception/member-not-found.exception";
import {
    SpaceNotFoundException, 
} from "@root/exception/space-not-found.exception";
import {
    DuplicateException, 
} from "@root/exception/duplicate.exception";
import {
    ReserveEntity, 
} from "@reserve/entity/reserve.entity";
import {
    ReserveLogEntity, 
} from "@reserve/entity/reserve-log.entity";
import {
    ReserveState, 
} from "@root/types/enums/reserveState";
import {
    ReserveNotFoundException, 
} from "@root/exception/reserve-not-found.exception";
import {
    GetReserveResponseDto, 
} from "@reserve/dto/res/get-reserve.response.dto";
import {
    PaginateRequestDto, 
} from "@root/interface/request/paginate.request.dto";
import {
    ReserveOptionDto, 
} from "@root/interface/request/reserve-option.dto";
import {
    PaginateData, 
} from "@root/interface/response/paginate.data";
import {
    GetReserveLogResponseDto, 
} from "@reserve/dto/res/get-reserve-log.response.dto";

@Injectable()
export class ReserveService {
    private readonly REDIS_LOCK_CREATE_RESERVE = "redis_lock_create_reserve";

    constructor(
        private readonly reserveRepository: ReserveRepository,
        private readonly reserveLogRepository: ReserveLogRepository,
        private readonly spaceRepository: SpaceRepository,
        private readonly memberRepository: MemberRepository,
        private readonly prismaService: PrismaService,
        @InjectRedis() private readonly redisClient: Redis
    ) {
    }

    async createReserve(dto: CreateReserveValidateRequestDto, token: MemberToken): Promise<CreateReserveResponseDto> {
        if (dto.memberId !== token.id) throw new ResourceUnauthorizedException();

        const lockStatus = await this.setLock(this.REDIS_LOCK_CREATE_RESERVE);
        if (!lockStatus) throw new ResourceLockException("Create Reserve");

        try {
            const result = await this.prismaService.$transaction(async (tx) => {
                const member = await this.memberRepository.findMemberById(dto.memberId, tx.member);
                if (!member) throw new MemberNotFoundException(`id: ${dto.memberId}`);
                const space = await this.spaceRepository.findSpaceById(dto.spaceId, tx.space);
                if (!space) throw new SpaceNotFoundException(`id: ${dto.spaceId}`);

                const duplicatedReserve
                    = await this.reserveRepository.findReserveForDuplicateReserve(
                        dto.spaceId, dto.startTime, dto.endTime, tx.reserve
                    );
                if (duplicatedReserve.length !== 0) throw new DuplicateException("Reserve");
                const reserve = new ReserveEntity(dto);
                const resultId = await this.reserveRepository.saveReserve(reserve);

                const reserveLog = new ReserveLogEntity({
                    reservedUser: member.nickname,
                    reservedSpaceName: space.name,
                    reservedLocation: space.location,
                    reservedTimes: `${reserve.startTime.toISOString()} - ${reserve.endTime.toISOString()}`,
                    state: ReserveState.RESERVE,
                });
                await this.reserveLogRepository.saveReserveLog(reserveLog);

                return resultId;
            });

            return {
                id: result,
            };
        } finally {
            await this.delLock(this.REDIS_LOCK_CREATE_RESERVE);
        }

    }

    async deleteReserve(id: string, token: MemberToken): Promise<null> {
        await this.prismaService.$transaction(async (tx) => {
            const {
                reserve,
                member,
                space,
            } = await this.reserveRepository.findReserveIncludeMemberAndSpace(id, tx.reserve);
            if (!reserve) throw new ReserveNotFoundException(`id: ${id}`);
            if (reserve.memberId !== token.id) throw new ResourceUnauthorizedException();

            await this.reserveRepository.deleteReserve(id, tx.reserve);
            const reserveLog: ReserveLogEntity = new ReserveLogEntity({
                reservedUser: member.nickname,
                reservedSpaceName: space.name,
                reservedLocation: space.location,
                reservedTimes: `${reserve.startTime.toISOString()} - ${reserve.endTime.toISOString()}`,
                state: ReserveState.CANCEL,
            });
            await this.reserveLogRepository.saveReserveLog(reserveLog, tx.reserveLog);
        });

        return null;
    }

    async getReserve(id: string, token: MemberToken): Promise<GetReserveResponseDto> {
        const reserve = await this.reserveRepository.findReserve(id);
        if (!reserve) throw new ReserveNotFoundException(`id: ${id}`);

        return {
            id: reserve.id,
            startTime: reserve.startTime.toISOString(),
            endTime: reserve.endTime.toISOString(),
            description: reserve.description,
        };
    }

    async getReserveList(paginateDto: PaginateRequestDto, optionDto: ReserveOptionDto)
        : Promise<PaginateData<GetReserveResponseDto>> {
        const reserves = await this.reserveRepository.findReserveBySpaceIdAndPaging(paginateDto, optionDto);

        const data: GetReserveResponseDto[] = reserves.map(reserve => {
            return {
                id: reserve.id,
                startTime: reserve.startTime.toISOString(),
                endTime: reserve.endTime.toISOString(),
                description: reserve.description,
            };
        });

        const totalCount = await this.reserveRepository.findReserveCount(optionDto);
        const totalPage = Math.ceil(totalCount / paginateDto.limit);
        const hasNextPage = paginateDto.page < totalPage;

        return {
            data: data,
            meta: {
                page: paginateDto.page,
                take: paginateDto.limit,
                totalCount,
                totalPage,
                hasNextPage,
            },
        };
    }

    async getMyReserveList(paginateDto: PaginateRequestDto, token: MemberToken)
        : Promise<PaginateData<GetReserveResponseDto>> {

        const reserves = await this.reserveRepository.findReserveByMemberIdAndPaging(paginateDto, token.id);

        const data: GetReserveResponseDto[] = reserves.map(reserve => {
            return {
                id: reserve.id,
                startTime: reserve.startTime.toISOString(),
                endTime: reserve.endTime.toISOString(),
                description: reserve.description,
            };
        });

        const totalCount = await this.reserveRepository.findMyReserveCount(token.id);
        const totalPage = Math.ceil(totalCount / paginateDto.limit);
        const hasNextPage = paginateDto.page < totalPage;

        return {
            data: data,
            meta: {
                page: paginateDto.page,
                take: paginateDto.limit,
                totalCount,
                totalPage,
                hasNextPage,
            },
        };
    }

    async getReserveLogList(paginateDto: PaginateRequestDto) {
        const reserveLogs = await this.reserveLogRepository.findReserveLogsByPaging(paginateDto);
        const data: GetReserveLogResponseDto[] = reserveLogs.map(reserveLogs => {
            return {
                id: reserveLogs.id,
                reservedUser: reserveLogs.reservedUser,
                reservedSpaceName: reserveLogs.reservedSpaceName,
                reservedLocation: reserveLogs.reservedLocation,
                reservedTimes: reserveLogs.reservedTimes,
                state: reserveLogs.state,
                createdAt: reserveLogs.createdAt.toISOString(),
            };
        });
        const totalCount = await this.reserveLogRepository.findReserveLogsCount();
        const totalPage = Math.ceil(totalCount / paginateDto.limit);
        const hasNextPage = paginateDto.page < totalPage;

        return {
            data: data,
            meta: {
                page: paginateDto.page,
                take: paginateDto.limit,
                totalCount,
                totalPage,
                hasNextPage,
            },
        };
    }

    private async setLock(key: string): Promise<boolean> {
        const value = await this.redisClient.set(key, "locked", "EX", 3, "NX");

        return value === "OK";
    }

    private async delLock(key: string) {
        await this.redisClient.del(key);

        return;
    }
}