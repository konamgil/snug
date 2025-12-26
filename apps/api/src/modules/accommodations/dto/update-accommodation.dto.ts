import { PartialType } from '@nestjs/swagger';
import { CreateAccommodationDto } from './create-accommodation.dto';

/**
 * 숙소 수정 DTO
 *
 * CreateAccommodationDto의 모든 필드를 optional로 만든 버전
 */
export class UpdateAccommodationDto extends PartialType(CreateAccommodationDto) {}
