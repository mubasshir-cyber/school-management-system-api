import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateExamsAndResultsSchema20260925230000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. exam_types
    await queryRunner.createTable(
      new Table({
        name: 'exam_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'weightage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: '100.00',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'ACTIVE'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'exam_types',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 2. grading_scales
    await queryRunner.createTable(
      new Table({
        name: 'grading_scales',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'scale_type',
            type: 'varchar',
            default: "'PERCENTAGE'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ranges',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'ACTIVE'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'grading_scales',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 3. exams
    await queryRunner.createTable(
      new Table({
        name: 'exams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'academic_year_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_type_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'grading_scale_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'DRAFT'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'exams',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exams',
      new TableForeignKey({
        columnNames: ['academic_year_id'],
        referencedTableName: 'academic_years',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exams',
      new TableForeignKey({
        columnNames: ['exam_type_id'],
        referencedTableName: 'exam_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'exams',
      new TableForeignKey({
        columnNames: ['grading_scale_id'],
        referencedTableName: 'grading_scales',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 4. exam_schedules
    await queryRunner.createTable(
      new Table({
        name: 'exam_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'section_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'subject_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'room_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'max_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '100.00',
          },
          {
            name: 'pass_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '35.00',
          },
          {
            name: 'theory_max_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '80.00',
          },
          {
            name: 'practical_max_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '20.00',
          },
          {
            name: 'invigilator_staff_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'SCHEDULED'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['exam_id'],
        referencedTableName: 'exams',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['class_id'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['section_id'],
        referencedTableName: 'sections',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['subject_id'],
        referencedTableName: 'subjects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_schedules',
      new TableForeignKey({
        columnNames: ['invigilator_staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 5. student_marks
    await queryRunner.createTable(
      new Table({
        name: 'student_marks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_schedule_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'theory_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '0.00',
          },
          {
            name: 'practical_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '0.00',
          },
          {
            name: 'internal_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            default: '0.00',
          },
          {
            name: 'total_marks',
            type: 'numeric',
            precision: 6,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'grade',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gpa_point',
            type: 'numeric',
            precision: 4,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'is_absent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'DRAFT'",
          },
          {
            name: 'evaluated_by_staff_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'student_marks',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'student_marks',
      new TableForeignKey({
        columnNames: ['exam_schedule_id'],
        referencedTableName: 'exam_schedules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'student_marks',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'students',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'student_marks',
      new TableForeignKey({
        columnNames: ['evaluated_by_staff_id'],
        referencedTableName: 'staff',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Unique index: a student has one mark record per exam schedule
    await queryRunner.createIndex(
      'student_marks',
      new TableIndex({
        name: 'IDX_student_marks_schedule_student',
        columnNames: ['exam_schedule_id', 'student_id'],
        isUnique: true,
      }),
    );

    // 6. exam_results
    await queryRunner.createTable(
      new Table({
        name: 'exam_results',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'exam_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'academic_year_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'section_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'total_max_marks',
            type: 'numeric',
            precision: 8,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'total_marks_obtained',
            type: 'numeric',
            precision: 8,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'percentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'gpa',
            type: 'numeric',
            precision: 4,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'overall_grade',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'result_status',
            type: 'varchar',
            default: "'PASSED'",
          },
          {
            name: 'rank',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'attendance_percentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'teacher_remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'principal_remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['exam_id'],
        referencedTableName: 'exams',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['student_id'],
        referencedTableName: 'students',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['academic_year_id'],
        referencedTableName: 'academic_years',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['class_id'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'exam_results',
      new TableForeignKey({
        columnNames: ['section_id'],
        referencedTableName: 'sections',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'exam_results',
      new TableIndex({
        name: 'IDX_exam_results_exam_student',
        columnNames: ['exam_id', 'student_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('exam_results', true, true, true);
    await queryRunner.dropTable('student_marks', true, true, true);
    await queryRunner.dropTable('exam_schedules', true, true, true);
    await queryRunner.dropTable('exams', true, true, true);
    await queryRunner.dropTable('grading_scales', true, true, true);
    await queryRunner.dropTable('exam_types', true, true, true);
  }
}
