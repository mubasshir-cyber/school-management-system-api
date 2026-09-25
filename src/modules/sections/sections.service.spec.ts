import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { Section } from './entities/section.entity';
import { AuditService } from '../audit/audit.service';

describe('SectionsService', () => {
  let service: SectionsService;
  let sectionRepo: any;

  beforeEach(async () => {
    sectionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-sec-1', ...entity })),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: getRepositoryToken(Section), useValue: sectionRepo },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create section successfully', async () => {
    sectionRepo.findOne
      .mockResolvedValueOnce(null) // for existing check
      .mockResolvedValueOnce({ id: 'uuid-sec-1', name: 'A', code: 'SEC-A' }); // for findOne

    const result = await service.create('tenant-1', 'school-1', {
      academicYearId: 'uuid-ay-1',
      classId: 'uuid-class-1',
      name: 'A',
      code: 'SEC-A',
      capacity: 40,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('uuid-sec-1');
  });
});
