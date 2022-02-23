import {MigrationInterface, QueryRunner} from "typeorm";

export class FakeOne1614244276988 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`cau sql chay o day`)
    }

    public async down(_: QueryRunner): Promise<void> {
    }

}
