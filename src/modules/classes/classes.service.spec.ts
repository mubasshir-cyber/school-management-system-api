import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassEntity } from './entities/class.entity';
import { AuditService } from '../audit/audit.service';

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepo: any;

  beforeEach(async () => {
    classRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-class-1', ...entity })),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(ClassEntity), useValue: classRepo },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new class successfully', async () => {
    classRepo.findOne.mockResolvedValue(null);

    const result = await service.create('tenant-1', 'school-1', {
      academicYearId: 'uuid-ay-1',
      name: 'Grade 10',
      code: 'G10',
      level: 10,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('uuid-class-1');
    expect(result.code).toBe('G10');
  });

  it('should throw ConflictException if class code already exists in academic year', async () => {
    classRepo.findOne.mockResolvedValue({ id: 'existing-id' });

    await expect(
      service.create('tenant-1', 'school-1', {
        academicYearId: 'uuid-ay-1',
        name: 'Grade 10',
        code: 'G10',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
