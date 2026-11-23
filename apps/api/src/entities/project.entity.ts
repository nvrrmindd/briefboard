import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brief } from './brief.entity';
import { Service, Stage } from './enums';
import { User } from './user.entity';

/** A job the studio is working on. Moves left-to-right across the board. */
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  clientName: string;

  @Column({ type: 'enum', enum: Service, array: true, default: [] })
  services: Service[];

  @Index()
  @Column({ type: 'enum', enum: Stage, default: Stage.STRATEGY })
  stage: Stage;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // A project created from a brief keeps the link; one brief -> at most one project.
  @OneToOne(() => Brief, (brief) => brief.project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'briefId' })
  brief: Brief | null;

  @Column({ type: 'uuid', nullable: true, unique: true })
  briefId: string | null;

  @ManyToOne(() => User, (user) => user.projects, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner: User | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null;
}
