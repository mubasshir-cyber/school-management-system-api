import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StudentsService } from '../students.service';
import { Student } from '../entities/student.entity';
import { NumberingSequenceService } from '../services/numbering-sequence.service';
import { AuditService } from '../../audit/audit.service';
import { StudentStatus } from '../../../common/enums/status.enum';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockStudentRepo: any;
  let mockSeqService: any;
  let mockAuditService: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockStudentRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'stu-1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(10),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'stu-1', firstName: 'Ahmed' }], 1]),
        getOne: jest.fn().mockResolvedValue({ id: 'stu-1', firstName: 'Ahmed', studentCode: 'STU-2026-000001' }),
      })),
    };

    mockSeqService = {
      getNextSequence: jest.fn().mockResolvedValue('STU-2026-000001'),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((_, entity) => entity),
          save: jest.fn().mockImplementation((_, entity) => Promise.resolve({ id: 'stu-1', ...entity })),
        };
        return callback(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: mockStudentRepo },
        { provide: NumberingSequenceService, useValue: mockSeqService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a student with auto-generated sequence code', async () => {
    const result = await service.create(
      'tenant-1',
      'school-1',
      'branch-1',
      {
        firstName: 'Ahmed',
        lastName: 'Khan',
        dateOfBirth: '2015-05-12',
        gender: 'Male',
      },
      'user-1',
    );

    expect(result).toBeDefined();
    expect(result.studentCode).toEqual('STU-2026-000001');
    expect(mockAuditService.log).toHaveBeenCalled();
  });

  it('should retrieve student 360 profile', async () => {
    const student = await service.findOne('tenant-1', 'school-1', 'stu-1');
    expect(student).toBeDefined();
    expect(student.firstName).toEqual('Ahmed');
  });

  it('should get student statistics', async () => {
    const stats = await service.getStatistics('tenant-1', 'school-1');
    expect(stats).toBeDefined();
    expect(stats.total).toBe(10);
  });
});
