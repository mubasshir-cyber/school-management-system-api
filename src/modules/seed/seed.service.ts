import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { Tenant } from '../tenants/entities/tenant.entity';
import { School } from '../tenants/entities/school.entity';
import { Branch } from '../tenants/entities/branch.entity';
import { Permission } from '../rbac/entities/permission.entity';
import { Role } from '../rbac/entities/role.entity';
import { RolePermission } from '../rbac/entities/role-permission.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { DataScope } from '../../common/enums/scope.enum';
import { DefaultRole, UserType } from '../../common/enums/role.enum';
import { CommonStatus } from '../../common/enums/status.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async seedAll() {
    this.logger.log('🌱 Starting database seed process...');

    // 1. Seed Permissions
    const permissions = await this.seedPermissions();

    // 2. Seed Default Tenant, School, Branch
    const { tenant, school, branch } = await this.seedTenantAndSchool();

    // 3. Seed Default Roles
    const roles = await this.seedRoles(tenant.id, school.id, permissions);

    // 4. Seed Super Admin User
    await this.seedSuperAdminUser(tenant.id, school.id, branch.id, roles);

    this.logger.log('✅ Database seed completed successfully!');
  }

  private async seedPermissions(): Promise<Permission[]> {
    const permissionDefinitions = [
      // Tenant & School
      { code: 'tenant.organization.create', module: 'tenant', resource: 'organization', action: 'create', name: 'Create Tenant Organization' },
      { code: 'tenant.organization.read', module: 'tenant', resource: 'organization', action: 'read', name: 'Read Tenant Organization' },
      { code: 'school.profile.create', module: 'school', resource: 'profile', action: 'create', name: 'Create School Profile' },
      { code: 'school.profile.read', module: 'school', resource: 'profile', action: 'read', name: 'Read School Profile' },
      { code: 'school.profile.update', module: 'school', resource: 'profile', action: 'update', name: 'Update School Profile' },
      { code: 'school.branch.create', module: 'school', resource: 'branch', action: 'create', name: 'Create Branch' },
      { code: 'school.branch.read', module: 'school', resource: 'branch', action: 'read', name: 'Read Branch' },
      { code: 'school.settings.manage', module: 'school', resource: 'settings', action: 'manage', name: 'Manage School Settings' },

      // RBAC & Users
      { code: 'rbac.role.create', module: 'rbac', resource: 'role', action: 'create', name: 'Create Role' },
      { code: 'rbac.role.read', module: 'rbac', resource: 'role', action: 'read', name: 'Read Roles' },
      { code: 'rbac.role.update', module: 'rbac', resource: 'role', action: 'update', name: 'Update Role' },
      { code: 'rbac.permission.create', module: 'rbac', resource: 'permission', action: 'create', name: 'Create Permission' },
      { code: 'rbac.permission.read', module: 'rbac', resource: 'permission', action: 'read', name: 'Read Permissions' },
      { code: 'user.account.create', module: 'user', resource: 'account', action: 'create', name: 'Create User' },
      { code: 'user.account.read', module: 'user', resource: 'account', action: 'read', name: 'Read Users' },
      { code: 'user.account.update', module: 'user', resource: 'account', action: 'update', name: 'Update User' },

      // Academic Structure
      { code: 'academic.year.create', module: 'academic', resource: 'year', action: 'create', name: 'Create Academic Year' },
      { code: 'academic.year.read', module: 'academic', resource: 'year', action: 'read', name: 'Read Academic Years' },
      { code: 'academic.year.update', module: 'academic', resource: 'year', action: 'update', name: 'Update Academic Year' },
      { code: 'academic.year.delete', module: 'academic', resource: 'year', action: 'delete', name: 'Delete Academic Year' },
      
      { code: 'class.create', module: 'academic', resource: 'class', action: 'create', name: 'Create Class' },
      { code: 'class.read', module: 'academic', resource: 'class', action: 'read', name: 'Read Classes' },
      { code: 'class.update', module: 'academic', resource: 'class', action: 'update', name: 'Update Class' },
      { code: 'class.delete', module: 'academic', resource: 'class', action: 'delete', name: 'Delete Class' },

      { code: 'section.create', module: 'academic', resource: 'section', action: 'create', name: 'Create Section' },
      { code: 'section.read', module: 'academic', resource: 'section', action: 'read', name: 'Read Sections' },
      { code: 'section.update', module: 'academic', resource: 'section', action: 'update', name: 'Update Section' },
      { code: 'section.delete', module: 'academic', resource: 'section', action: 'delete', name: 'Delete Section' },

      { code: 'subject.create', module: 'academic', resource: 'subject', action: 'create', name: 'Create Subject' },
      { code: 'subject.read', module: 'academic', resource: 'subject', action: 'read', name: 'Read Subjects' },
      { code: 'subject.update', module: 'academic', resource: 'subject', action: 'update', name: 'Update Subject' },
      { code: 'subject.delete', module: 'academic', resource: 'subject', action: 'delete', name: 'Delete Subject' },

      { code: 'assignment.create', module: 'academic', resource: 'assignment', action: 'create', name: 'Create Teacher Assignment' },
      { code: 'assignment.read', module: 'academic', resource: 'assignment', action: 'read', name: 'Read Teacher Assignments' },
      { code: 'assignment.update', module: 'academic', resource: 'assignment', action: 'update', name: 'Update Teacher Assignment' },
      { code: 'assignment.delete', module: 'academic', resource: 'assignment', action: 'delete', name: 'Delete Teacher Assignment' },

      // Students
      { code: 'student.profile.create', module: 'student', resource: 'profile', action: 'create', name: 'Create Student' },
      { code: 'student.profile.read', module: 'student', resource: 'profile', action: 'read', name: 'Read Student Profile' },
      { code: 'student.profile.update', module: 'student', resource: 'profile', action: 'update', name: 'Update Student Profile' },
      { code: 'student.profile.delete', module: 'student', resource: 'profile', action: 'delete', name: 'Delete Student Profile' },
      { code: 'student.profile.export', module: 'student', resource: 'profile', action: 'export', name: 'Export Student Records' },

      // Staff & HR
      { code: 'staff.profile.create', module: 'staff', resource: 'profile', action: 'create', name: 'Create Staff' },
      { code: 'staff.profile.read', module: 'staff', resource: 'profile', action: 'read', name: 'Read Staff Profiles' },
      { code: 'staff.profile.update', module: 'staff', resource: 'profile', action: 'update', name: 'Update Staff Profile' },

      // Attendance
      { code: 'attendance.student.create', module: 'attendance', resource: 'student', action: 'create', name: 'Mark Student Attendance' },
      { code: 'attendance.student.read', module: 'attendance', resource: 'student', action: 'read', name: 'Read Student Attendance' },
      { code: 'attendance.staff.create', module: 'attendance', resource: 'staff', action: 'create', name: 'Mark Staff Attendance' },
      { code: 'attendance.staff.read', module: 'attendance', resource: 'staff', action: 'read', name: 'Read Staff Attendance' },
      { code: 'attendance.leave.approve', module: 'attendance', resource: 'leave', action: 'approve', name: 'Approve Leaves' },

      // Fees
      { code: 'fee.structure.manage', module: 'fee', resource: 'structure', action: 'manage', name: 'Manage Fee Structure' },
      { code: 'fee.ledger.read', module: 'fee', resource: 'ledger', action: 'read', name: 'Read Fee Ledger' },
      { code: 'fee.payment.collect', module: 'fee', resource: 'payment', action: 'collect', name: 'Collect Fee Payment' },
      { code: 'fee.payment.refund', module: 'fee', resource: 'payment', action: 'refund', name: 'Refund Fee Payment' },

      // Payroll
      { code: 'payroll.salary.read', module: 'payroll', resource: 'salary', action: 'read', name: 'Read Payroll & Salary' },
      { code: 'payroll.salary.calculate', module: 'payroll', resource: 'salary', action: 'calculate', name: 'Calculate Monthly Payroll' },
      { code: 'payroll.salary.approve', module: 'payroll', resource: 'salary', action: 'approve', name: 'Approve Payroll' },
      { code: 'payroll.salary.pay', module: 'payroll', resource: 'salary', action: 'pay', name: 'Disburse Salary Payments' },

      // Exams
      { code: 'exam.schedule.manage', module: 'exam', resource: 'schedule', action: 'manage', name: 'Manage Exam Schedules' },
      { code: 'exam.marks.create', module: 'exam', resource: 'marks', action: 'create', name: 'Enter Exam Marks' },
      { code: 'exam.marks.publish', module: 'exam', resource: 'marks', action: 'publish', name: 'Publish Exam Results' },
      { code: 'exam.report_card.generate', module: 'exam', resource: 'report_card', action: 'generate', name: 'Generate Report Cards' },

      // Audit
      { code: 'audit.log.read', module: 'audit', resource: 'log', action: 'read', name: 'View Immutable Audit Logs' },
    ];

    const savedPermissions: Permission[] = [];

    for (const p of permissionDefinitions) {
      let perm = await this.permissionRepo.findOne({ where: { code: p.code } });
      if (!perm) {
        perm = this.permissionRepo.create({ ...p, isSystem: true });
        perm = await this.permissionRepo.save(perm);
      }
      savedPermissions.push(perm);
    }

    return savedPermissions;
  }

  private async seedTenantAndSchool() {
    let tenant = await this.tenantRepo.findOne({ where: { code: 'DEMO-TRUST' } });
    if (!tenant) {
      tenant = this.tenantRepo.create({
        name: 'Apex Global Education Trust',
        code: 'DEMO-TRUST',
        domain: 'apexedu.org',
        contactEmail: 'trust@apexedu.org',
        contactPhone: '+91 9800000000',
        status: CommonStatus.ACTIVE,
      });
      tenant = await this.tenantRepo.save(tenant);
    }

    let school = await this.schoolRepo.findOne({ where: { code: 'APEX-DELHI' } });
    if (!school) {
      school = this.schoolRepo.create({
        tenantId: tenant.id,
        name: 'Apex International School',
        code: 'APEX-DELHI',
        board: 'CBSE',
        medium: 'English',
        schoolType: 'Co-Educational',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
        email: 'info@apexdelhi.edu',
        phone: '+91 11 23456789',
        principalName: 'Dr. Robert Vance',
        status: CommonStatus.ACTIVE,
      });
      school = await this.schoolRepo.save(school);
    }

    let branch = await this.branchRepo.findOne({ where: { schoolId: school.id, code: 'MAIN' } });
    if (!branch) {
      branch = this.branchRepo.create({
        tenantId: tenant.id,
        schoolId: school.id,
        name: 'Main Campus',
        code: 'MAIN',
        isMainBranch: true,
        city: 'New Delhi',
        address: '12 Barakhamba Road, Connaught Place',
        status: CommonStatus.ACTIVE,
      });
      branch = await this.branchRepo.save(branch);
    }

    return { tenant, school, branch };
  }

  private async seedRoles(
    tenantId: string,
    schoolId: string,
    permissions: Permission[],
  ): Promise<Map<string, Role>> {
    const roleDefinitions = [
      {
        code: DefaultRole.SUPER_ADMIN,
        name: 'Super Admin',
        description: 'Full unconstrained platform control',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.PRINCIPAL,
        name: 'Principal',
        description: 'School leader with full academic and approval authority',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.SCHOOL_ADMIN,
        name: 'School Admin',
        description: 'Administrative operator for school entities',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.ACCOUNTANT,
        name: 'Accountant',
        description: 'Finance, fees, ledger and expense management',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.HR_MANAGER,
        name: 'HR Manager',
        description: 'Staff onboarding, leaves and payroll management',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.TEACHER,
        name: 'Teacher',
        description: 'Subject teacher for attendance and marks',
        defaultScope: DataScope.CLASS,
        isSystem: true,
      },
      {
        code: DefaultRole.CLASS_TEACHER,
        name: 'Class Teacher',
        description: 'Assigned class section manager',
        defaultScope: DataScope.SECTION,
        isSystem: true,
      },
      {
        code: DefaultRole.RECEPTIONIST,
        name: 'Receptionist',
        description: 'Front desk, enquiries, student admissions',
        defaultScope: DataScope.BRANCH,
        isSystem: true,
      },
      {
        code: DefaultRole.FEE_COLLECTOR,
        name: 'Fee Collector',
        description: 'Fee collection counter operator',
        defaultScope: DataScope.BRANCH,
        isSystem: true,
      },
      {
        code: DefaultRole.EXAM_COORDINATOR,
        name: 'Exam Coordinator',
        description: 'Examination scheduling and result calculation',
        defaultScope: DataScope.ORGANIZATION,
        isSystem: true,
      },
      {
        code: DefaultRole.STAFF,
        name: 'Staff',
        description: 'General institution staff',
        defaultScope: DataScope.SELF,
        isSystem: true,
      },
      {
        code: DefaultRole.PARENT,
        name: 'Parent',
        description: 'Guardian portal access for linked children',
        defaultScope: DataScope.SELF,
        isSystem: true,
      },
      {
        code: DefaultRole.STUDENT,
        name: 'Student',
        description: 'Student portal access for individual records',
        defaultScope: DataScope.SELF,
        isSystem: true,
      },
    ];

    const roleMap = new Map<string, Role>();

    for (const r of roleDefinitions) {
      let role = await this.roleRepo.findOne({ where: { code: r.code } });
      if (!role) {
        role = this.roleRepo.create({
          ...r,
          tenantId,
          schoolId,
          status: CommonStatus.ACTIVE,
        });
        role = await this.roleRepo.save(role);
      }
      roleMap.set(r.code, role);

      // Assign all permissions to Super Admin & Principal
      if (r.code === DefaultRole.SUPER_ADMIN || r.code === DefaultRole.PRINCIPAL) {
        for (const perm of permissions) {
          const exists = await this.rolePermissionRepo.findOne({
            where: { roleId: role.id, permissionId: perm.id },
          });
          if (!exists) {
            await this.rolePermissionRepo.save(
              this.rolePermissionRepo.create({
                roleId: role.id,
                permissionId: perm.id,
              }),
            );
          }
        }
      }
    }

    return roleMap;
  }

  private async seedSuperAdminUser(
    tenantId: string,
    schoolId: string,
    branchId: string,
    roleMap: Map<string, Role>,
  ) {
    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@school.edu';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@2026';
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      const passwordHash = await argon2.hash(password);

      user = this.userRepo.create({
        tenantId,
        schoolId,
        branchId,
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'SuperAdmin',
        userType: UserType.ADMIN,
        status: CommonStatus.ACTIVE,
        isEmailVerified: true,
      });

      user = await this.userRepo.save(user);

      const superAdminRole = roleMap.get(DefaultRole.SUPER_ADMIN);
      if (superAdminRole) {
        await this.userRoleRepo.save(
          this.userRoleRepo.create({
            userId: user.id,
            roleId: superAdminRole.id,
          }),
        );
      }
    }
  }
}
