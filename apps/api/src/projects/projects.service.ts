import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brief } from '../entities/brief.entity';
import { BriefStatus, STAGE_ORDER, Stage } from '../entities/enums';
import { Project } from '../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { canMoveStage } from './stage-rules';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Brief) private readonly briefs: Repository<Brief>,
  ) {}

  list() {
    return this.projects.find({
      relations: { owner: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async get(id: string) {
    const project = await this.projects.findOne({ where: { id }, relations: { owner: true, brief: true } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto, ownerId: string) {
    return this.projects.save(
      this.projects.create({ ...dto, services: dto.services ?? [], dueDate: dto.dueDate ?? null, ownerId }),
    );
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.get(id);
    Object.assign(project, dto);
    return this.projects.save(project);
  }

  async moveStage(id: string, to: Stage) {
    const project = await this.get(id);
    if (!canMoveStage(project.stage, to)) {
      throw new BadRequestException(
        `Cannot move from ${project.stage} to ${to}: forward moves go one column at a time`,
      );
    }
    project.stage = to;
    return this.projects.save(project);
  }

  async remove(id: string) {
    const project = await this.get(id);
    await this.projects.remove(project);
  }

  /** Numbers for the dashboard header: projects per column + briefs waiting for a reply. */
  async stats() {
    const rows = await this.projects
      .createQueryBuilder('p')
      .select('p.stage', 'stage')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('p.stage')
      .getRawMany<{ stage: Stage; count: number }>();
    const byStage = Object.fromEntries(STAGE_ORDER.map((s) => [s, 0])) as Record<Stage, number>;
    for (const r of rows) byStage[r.stage] = r.count;
    const newBriefs = await this.briefs.countBy({ status: BriefStatus.NEW });
    return { byStage, newBriefs, total: Object.values(byStage).reduce((a, b) => a + b, 0) };
  }
}
