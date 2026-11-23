import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from '../auth/auth.service';
import { CurrentUser, JwtAuthGuard } from '../auth/guards';
import { BriefsService } from './briefs.service';
import { CreateBriefDto, ListBriefsQuery } from './dto/brief.dto';

@ApiTags('briefs')
@Controller('briefs')
export class BriefsController {
  constructor(private readonly briefs: BriefsService) {}

  /** Public: the form on the landing page posts here. No login needed. */
  @Post()
  create(@Body() dto: CreateBriefDto) {
    return this.briefs.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  list(@Query() query: ListBriefsQuery) {
    return this.briefs.list(query.status);
  }

  @Patch(':id/accept')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  accept(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.briefs.accept(id, user.sub);
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.briefs.reject(id);
  }
}
