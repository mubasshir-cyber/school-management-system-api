import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AdmissionsService } from '../admissions.service';
import { Admission } from '../entities/admission.entity';
import { NumberingSequenceService } from '../../students/services/numbering-sequence.service';
import { AuditService } from '../../audit/audit.service';
import { AdmissionStatus } from '../../../common/enums/status.enum';

describe('AdmissionsService', () => {
  let service: AdmissionsService;
  let mockAdmissionRepo: any;
  let mockSeqService: any;
  let mockAuditService: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockAdmissionRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'adm-1', ...entity })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'adm-1', applicationNumber: 'ADM-2026-000001' }]),
        getOne: jest.fn().mockResolvedValue({
          id: 'adm-1',
          applicationNumber: 'ADM-2026-000001',
          status: AdmissionStatus.DRAFT,
          firstName: 'Zayd',
          lastName: 'Mansoor',
          dateOfBirth: '2016-08-20',
          gender: 'Male',
          guardianName: 'Mansoor Ali',
          guardianMobile: '+91 9988776655',
          academicYearId: 'year-1',
          classId: 'class-1',
          preferredSectionId: 'sec-1',
        }),
      })),
    };

    mockSeqService = {
      getNextSequence: jest.fn().mockResolvedValue('ADM-2026-000001'),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        const manager = {
          create: jest.fn().mockImplementation((_, entity) => entity),
          save: jest.fn().mockImplementation((_, entity) => Promise.resolve({ id: 'id-1', ...entity })),
        };
        return callback(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: getRepositoryToken(Admission), useValue: mockAdmissionRepo },
        { provide: NumberingSequenceService, useValue: mockSeqService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AdmissionsService>(AdmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an admission application in DRAFT state', async () => {
    const result = await service.create(
      'tenant-1',
      'school-1',
      'branch-1',
      {
        academicYearId: 'year-1',
        classId: 'class-1',
        firstName: 'Zayd',
        lastName: 'Mansoor',
        dateOfBirth: '2016-08-20',
        gender: 'Male',
        guardianName: 'Mansoor Ali',
        guardianMobile: '+91 9988776655',
      },
      'user-1',
    );

    expect(result).toBeDefined();
    expect(result.status).toEqual(AdmissionStatus.DRAFT);
  });

  it('should submit an application from DRAFT to SUBMITTED', async () => {
    const result = await service.submit('tenant-1', 'school-1', 'adm-1', 'user-1');
    expect(result.status).toEqual(AdmissionStatus.SUBMITTED);
  });
});
