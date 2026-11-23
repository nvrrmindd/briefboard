import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BriefStatus, Service } from '../../entities/enums';

export class CreateBriefDto {
  @ApiProperty({ example: 'Dana Seitkali' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  clientName: string;

  @ApiPropertyOptional({ example: 'Qazaq Coffee' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  company?: string;

  @ApiProperty({ example: 'dana@qazaqcoffee.kz' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Service, isArray: true, example: [Service.BRANDING, Service.WEB] })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Service, { each: true })
  services: Service[];

  @ApiPropertyOptional({ example: '1 500 000 – 3 000 000 ₸' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  budget?: string;

  @ApiPropertyOptional({ example: '2027-03-01' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ example: 'New coffee chain: need a name check, logo, identity and a landing page.' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;
}

export class ListBriefsQuery {
  @ApiPropertyOptional({ enum: BriefStatus })
  @IsOptional()
  @IsEnum(BriefStatus)
  status?: BriefStatus;
}
