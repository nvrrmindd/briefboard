import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1795434704903 implements MigrationInterface {
    name = 'Init1795434704903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'MEMBER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."projects_services_enum" AS ENUM('BRANDING', 'SMM', 'WEB', 'MARKETING', 'VIDEO')`);
        await queryRunner.query(`CREATE TYPE "public"."projects_stage_enum" AS ENUM('STRATEGY', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'DELIVERED')`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "clientName" character varying NOT NULL, "services" "public"."projects_services_enum" array NOT NULL DEFAULT '{}', "stage" "public"."projects_stage_enum" NOT NULL DEFAULT 'STRATEGY', "dueDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "briefId" uuid, "ownerId" uuid, CONSTRAINT "UQ_57115b7f5e1e4778303f60b1298" UNIQUE ("briefId"), CONSTRAINT "REL_57115b7f5e1e4778303f60b129" UNIQUE ("briefId"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8008efe4358d403d5fa750f155" ON "projects" ("stage") `);
        await queryRunner.query(`CREATE TYPE "public"."briefs_services_enum" AS ENUM('BRANDING', 'SMM', 'WEB', 'MARKETING', 'VIDEO')`);
        await queryRunner.query(`CREATE TYPE "public"."briefs_status_enum" AS ENUM('NEW', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "briefs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientName" character varying NOT NULL, "company" character varying, "email" character varying NOT NULL, "services" "public"."briefs_services_enum" array NOT NULL, "budget" character varying, "deadline" date, "description" text NOT NULL, "status" "public"."briefs_status_enum" NOT NULL DEFAULT 'NEW', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1e3944bfaf5baf0f14b0bc892b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_50bdb5350046dd8d77dda3ff0d" ON "briefs" ("status", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_57115b7f5e1e4778303f60b1298" FOREIGN KEY ("briefId") REFERENCES "briefs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_a8e7e6c3f9d9528ed35fe5bae33" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_a8e7e6c3f9d9528ed35fe5bae33"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_57115b7f5e1e4778303f60b1298"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_50bdb5350046dd8d77dda3ff0d"`);
        await queryRunner.query(`DROP TABLE "briefs"`);
        await queryRunner.query(`DROP TYPE "public"."briefs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."briefs_services_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8008efe4358d403d5fa750f155"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_stage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projects_services_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
