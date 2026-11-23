import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brief } from '../entities/brief.entity';
import { Project } from '../entities/project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Brief])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
