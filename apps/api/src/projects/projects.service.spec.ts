import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brief } from '../entities/brief.entity';
import { Stage } from '../entities/enums';
import { Project } from '../entities/project.entity';
import { ProjectsService } from './projects.service';

// Unit test: the repository is a mock, so no database is needed.
describe('ProjectsService.moveStage', () => {
  let service: ProjectsService;
  const repo = { findOne: jest.fn(), save: jest.fn((p) => Promise.resolve(p)) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: repo },
        { provide: getRepositoryToken(Brief), useValue: {} },
      ],
    }).compile();
    service = moduleRef.get(ProjectsService);
  });

  it('saves a valid one-step move', async () => {
    repo.findOne.mockResolvedValue({ id: '1', stage: Stage.DESIGN });
    const result = await service.moveStage('1', Stage.DEVELOPMENT);
    expect(result.stage).toBe(Stage.DEVELOPMENT);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('refuses to skip review and does not save', async () => {
    repo.findOne.mockResolvedValue({ id: '1', stage: Stage.DEVELOPMENT });
    await expect(service.moveStage('1', Stage.DELIVERED)).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown project', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.moveStage('x', Stage.DESIGN)).rejects.toBeInstanceOf(NotFoundException);
  });
});
