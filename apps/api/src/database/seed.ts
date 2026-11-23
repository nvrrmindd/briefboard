import * as bcrypt from 'bcryptjs';
import { Brief } from '../entities/brief.entity';
import { BriefStatus, Role, Service, Stage } from '../entities/enums';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import dataSource from './data-source';

/** Demo data so the board isn't empty. Safe to run twice: it skips if the admin exists. */
async function seed() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  const users = dataSource.getRepository(User);

  if (await users.existsBy({ email: 'admin@briefboard.dev' })) {
    console.log('Seed already applied, skipping.');
    return dataSource.destroy();
  }

  const admin = await users.save(
    users.create({
      email: 'admin@briefboard.dev',
      name: 'Studio Admin',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash('admin12345', 10),
    }),
  );

  await dataSource.getRepository(Brief).save([
    {
      clientName: 'Dana Seitkali',
      company: 'Qazaq Coffee',
      email: 'dana@qazaqcoffee.kz',
      services: [Service.BRANDING, Service.WEB],
      budget: '1.5–3M ₸',
      deadline: '2027-03-01',
      description: 'Opening a specialty coffee chain in Almaty. Need naming check, logo, identity and a landing page.',
      status: BriefStatus.NEW,
    },
    {
      clientName: 'Arman Bekov',
      company: 'Steppe Run',
      email: 'arman@stepperun.kz',
      services: [Service.SMM, Service.VIDEO],
      budget: '800k ₸ / month',
      deadline: null,
      description: 'Running club needs monthly content: reels from weekend races and a content plan.',
      status: BriefStatus.NEW,
    },
  ]);

  const p = (title: string, clientName: string, services: Service[], stage: Stage, dueDate: string | null) => ({
    title,
    clientName,
    services,
    stage,
    dueDate,
    ownerId: admin.id,
  });
  await dataSource.getRepository(Project).save([
    p('Aral Market: autumn campaign', 'Aral Market', [Service.MARKETING, Service.SMM], Stage.STRATEGY, '2027-01-20'),
    p('Tumar Tea: identity refresh', 'Tumar Tea', [Service.BRANDING], Stage.DESIGN, '2027-02-10'),
    p('Koktem Residence: website', 'Koktem Residence', [Service.WEB], Stage.DEVELOPMENT, '2027-01-31'),
    p('Saryarka Sport: launch video', 'Saryarka Sport', [Service.VIDEO], Stage.REVIEW, '2026-12-20'),
    p('Bota Kids: packaging', 'Bota Kids', [Service.BRANDING], Stage.DELIVERED, null),
  ]);

  console.log('Seeded: admin@briefboard.dev / admin12345, 2 briefs, 5 projects');
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
