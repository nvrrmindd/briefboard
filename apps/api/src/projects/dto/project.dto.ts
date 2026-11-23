import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Service, Stage } from '../../entities/enums';

export class CreateProjectDto {
  @ApiProperty({ example: 'Aral Market: launch campaign' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Aral Market' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  clientName: string;

  @ApiPropertyOptional({ enum: Service, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Service, { each: true })
  services?: Service[];

  @ApiPropertyOptional({ example: '2027-02-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

/** Every field optional. Stage is NOT here: it changes only through /stage (with rules). */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class MoveStageDto {
  @ApiProperty({ enum: Stage })
  @IsEnum(Stage)
  stage: Stage;
}
