
import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateEventManagement1730000000000
  implements MigrationInterface
{
  name = 'CreateEventManagement1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE events (
        id CHAR(36) NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        location VARCHAR(200) NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('PLANNED', 'ONGOING', 'COMPLETED')
          NOT NULL DEFAULT 'PLANNED',
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at DATETIME(6) NULL,
        INDEX IDX_events_status (status),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE participants (
        id CHAR(36) NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        event_id CHAR(36) NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at DATETIME(6) NULL,
        INDEX IDX_participants_event_id (event_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_participants_event
          FOREIGN KEY (event_id)
          REFERENCES events(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE participants
    `);

    await queryRunner.query(`
      DROP TABLE events
    `);
  }
}
