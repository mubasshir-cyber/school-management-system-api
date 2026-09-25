import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { School } from './entities/school.entity';
import { Branch } from './entities/branch.entity';
import { SchoolSettings } from './entities/school-settings.entity';
import { CreateTenantDto, CreateSchoolDto, CreateBranchDto } from './dto/tenants.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(SchoolSettings)
    private readonly settingsRepo: Repository<SchoolSettings>,
    private readonly auditService: AuditService,
  ) {}

  // ---------------- TENANTS ----------------
  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Tenant with code ${dto.code} already exists`);
    }

    const tenant = this.tenantRepo.create(dto);
    const saved = await this.tenantRepo.save(tenant);

    await this.auditService.log({
      tenantId: saved.id,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'tenants',
      entity: 'Tenant',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  // ---------------- SCHOOLS ----------------
  async createSchool(tenantId: string, dto: CreateSchoolDto): Promise<School> {
    await this.getTenantById(tenantId);

    const existing = await this.schoolRepo.findOne({
      where: { code: dto.code, tenantId },
    });
    if (existing) {
      throw new ConflictException(
        `School with code ${dto.code} already exists in this organization`,
      );
    }

    const school = this.schoolRepo.create({
      ...dto,
      tenantId,
    });

    const savedSchool = await this.schoolRepo.save(school);

    // Auto-create default main branch
    const mainBranch = this.branchRepo.create({
      tenantId,
      schoolId: savedSchool.id,
      name: 'Main Campus',
      code: 'MAIN',
      isMainBranch: true,
      city: dto.city,
      address: dto.address,
    });
    await this.branchRepo.save(mainBranch);

    await this.auditService.log({
      tenantId,
      schoolId: savedSchool.id,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'tenants',
      entity: 'School',
      entityId: savedSchool.id,
      newValue: savedSchool,
    });

    return savedSchool;
  }

  async getSchoolsByTenant(tenantId: string): Promise<School[]> {
    return this.schoolRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async getSchoolById(id: string): Promise<School> {
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return school;
  }

  // ---------------- BRANCHES ----------------
  async createBranch(
    tenantId: string,
    schoolId: string,
    dto: CreateBranchDto,
  ): Promise<Branch> {
    await this.getSchoolById(schoolId);

    const branch = this.branchRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.branchRepo.save(branch);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: saved.id,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'tenants',
      entity: 'Branch',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getBranchesBySchool(schoolId: string): Promise<Branch[]> {
    return this.branchRepo.find({
      where: { schoolId },
      order: { isMainBranch: 'DESC', name: 'ASC' },
    });
  }

  // ---------------- SETTINGS ----------------
  async getSchoolSettings(schoolId: string, category?: string) {
    const where: any = { schoolId };
    if (category) where.category = category;
    return this.settingsRepo.find({ where });
  }

  async setSchoolSetting(
    tenantId: string,
    schoolId: string,
    category: string,
    key: string,
    value: any,
  ) {
    let setting = await this.settingsRepo.findOne({
      where: { schoolId, settingKey: key },
    });

    if (setting) {
      setting.settingValue = value;
    } else {
      setting = this.settingsRepo.create({
        tenantId,
        schoolId,
        category,
        settingKey: key,
        settingValue: value,
      });
    }

    return this.settingsRepo.save(setting);
  }
}
