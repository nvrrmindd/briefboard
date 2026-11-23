import { Column, CreateDateColumn, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BriefStatus, Service } from './enums';
import { Project } from './project.entity';

/** A request a client sends from the public website. */
@Entity('briefs')
@Index(['status', 'createdAt'])
export class Brief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientName: string;

  @Column({ type: 'varchar', nullable: true })
  company: string | null;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: Service, array: true })
  services: Service[];

  @Column({ type: 'varchar', nullable: true })
  budget: string | null;

  @Column({ type: 'date', nullable: true })
  deadline: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: BriefStatus, default: BriefStatus.NEW })
  status: BriefStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Project, (project) => project.brief)
  project?: Project;
}
