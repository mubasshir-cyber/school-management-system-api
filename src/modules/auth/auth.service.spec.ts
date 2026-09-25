import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditService } from '../audit/audit.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { CommonStatus } from '../../common/enums/status.enum';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      getUserById: jest.fn(),
      recordLogin: jest.fn(),
      handleFailedLogin: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RbacService, useValue: { getUserPermissions: jest.fn().mockResolvedValue([]) } },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => 'test-secret') },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue({ id: 'mock-token-id' }),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should authenticate user with valid credentials', async () => {
    const rawPassword = 'ValidPassword@123';
    const passwordHash = await argon2.hash(rawPassword);

    const mockUser: any = {
      id: 'uuid-123',
      email: 'user@school.edu',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      status: CommonStatus.ACTIVE,
      userRoles: [],
    };

    usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'user@school.edu',
      password: rawPassword,
    });

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('mocked.jwt.token');
    expect(result.user.email).toBe('user@school.edu');
    expect(usersService.recordLogin).toHaveBeenCalledWith('uuid-123', undefined);
  });
});
