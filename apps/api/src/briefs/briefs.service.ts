import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Brief } from '../entities/brief.entity';
import { BriefStatus, Stage } from '../entities/enums';
import { Project } from '../entities/project.entity';
import { CreateBriefDto } from './dto/brief.dto';

@Injectable()
export class BriefsService {
  constructor(
    @InjectRepository(Brief) private readonly briefs: Repository<Brief>,
    private readonly dataSource: DataSource,
  ) {}

  create(dto: CreateBriefDto) {
    return this.briefs.save(
      this.briefs.create({
        ...dto,
        email: dto.email.toLowerCase(),
        company: dto.company ?? null,
        budget: dto.budget ?? null,
        deadline: dto.deadline ?? null,
      }),
    );
  }

  list(status?: BriefStatus) {
    return this.briefs.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Accepting a brief does two writes: mark the brief ACCEPTED and create a project.
   * They run in one transaction, so we never end up with only one of them saved.
   */
  async accept(id: string, ownerId: string): Promise<Project> {
    return this.dataSource.transaction(async (em) => {
      // Row lock: two managers clicking "Accept" at once can't create two projects.
      const brief = await em.findOne(Brief, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!brief) throw new NotFoundException('Brief not found');
      if (brief.status !== BriefStatus.NEW) {
        throw new ConflictException(`Brief is already ${brief.status.toLowerCase()}`);
      }
      brief.status = BriefStatus.ACCEPTED;
      await em.save(brief);

      const project = em.create(Project, {
        title: `${brief.company ?? brief.clientName}: ${brief.services.join(' + ').toLowerCase()}`,
        clientName: brief.clientName,
        services: brief.services,
        stage: Stage.STRATEGY,
        dueDate: brief.deadline,
        briefId: brief.id,
        ownerId,
      });
      return em.save(project);
    });
  }

  async reject(id: string): Promise<Brief> {
    const brief = await this.briefs.findOneBy({ id });
    if (!brief) throw new NotFoundException('Brief not found');
    if (brief.status !== BriefStatus.NEW) {
      throw new ConflictException(`Brief is already ${brief.status.toLowerCase()}`);
    }
    brief.status = BriefStatus.REJECTED;
    return this.briefs.save(brief);
  }
}
