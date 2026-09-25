import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { AuditService } from '../audit/audit.service';
import { SubjectType } from '../../common/enums/subject-type.enum';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let subjectRepo: any;

  beforeEach(async () => {
    subjectRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-sub-1', ...entity })),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getRepositoryToken(Subject), useValue: subjectRepo },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a subject successfully', async () => {
    subjectRepo.findOne.mockResolvedValue(null);

    const result = await service.create('tenant-1', 'school-1', {
      name: 'Mathematics',
      code: 'MATH-101',
      type: SubjectType.CORE,
      theoryMaxMarks: 80,
      practicalMaxMarks: 20,
      passingMarks: 33,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('uuid-sub-1');
    expect(result.code).toBe('MATH-101');
  });
});
