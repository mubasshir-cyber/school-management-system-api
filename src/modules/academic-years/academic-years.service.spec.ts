import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYear } from './entities/academic-year.entity';
import { AuditService } from '../audit/audit.service';
import { CommonStatus } from '../../common/enums/status.enum';

describe('AcademicYearsService', () => {
  let service: AcademicYearsService;
  let academicYearRepo: any;

  beforeEach(async () => {
    academicYearRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-ay-1', ...entity })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicYearsService,
        { provide: getRepositoryToken(AcademicYear), useValue: academicYearRepo },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<AcademicYearsService>(AcademicYearsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if startDate >= endDate', async () => {
    await expect(
      service.create('tenant-1', 'school-1', {
        name: '2026-27',
        code: 'AY-2026-27',
        startDate: '2027-04-01',
        endDate: '2026-03-31',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create an academic year successfully', async () => {
    academicYearRepo.findOne.mockResolvedValue(null);

    const result = await service.create('tenant-1', 'school-1', {
      name: '2026-27',
      code: 'AY-2026-27',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      isCurrent: true,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('uuid-ay-1');
    expect(result.code).toBe('AY-2026-27');
    expect(academicYearRepo.update).toHaveBeenCalledWith(
      { schoolId: 'school-1' },
      { isCurrent: false },
    );
  });
});
