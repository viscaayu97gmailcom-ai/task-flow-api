import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1795230970073 implements MigrationInterface {
    name = 'CreateTasksTable1795230970073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`status\` enum ('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO', \`due_date\` datetime NULL, INDEX \`IDX_tasks_status\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_tasks_status\` ON \`tasks\``);
        await queryRunner.query(`DROP TABLE \`tasks\``);
    }

}
