import { Column, Entity, Index } from 'typeorm';
import { TaskStatus } from '../enums/task-status.enum';
import { ITask } from '../interfaces/task.interface';
import { BaseEntity } from './base.entity';

@Entity({ name: 'tasks' })
export class Task extends BaseEntity implements ITask {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('IDX_tasks_status')
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({ name: 'due_date', type: 'datetime', nullable: true })
  dueDate!: Date | null;
}