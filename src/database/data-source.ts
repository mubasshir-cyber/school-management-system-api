import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { School } from '../modules/tenants/entities/school.entity';
import { Branch } from '../modules/tenants/entities/branch.entity';
import { SchoolSettings } from '../modules/tenants/entities/school-settings.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserSession } from '../modules/users/entities/user-session.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { RolePermission } from '../modules/rbac/entities/role-permission.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { AcademicYear } from '../modules/academic-years/entities/academic-year.entity';
import { ClassEntity } from '../modules/classes/entities/class.entity';
import { Section } from '../modules/sections/entities/section.entity';
import { Subject } from '../modules/subjects/entities/subject.entity';
import { ClassSubject } from '../modules/class-subjects/entities/class-subject.entity';
import { TeacherClassAssignment } from '../modules/teacher-assignments/entities/teacher-class-assignment.entity';
import { TeacherSubjectAssignment } from '../modules/teacher-assignments/entities/teacher-subject-assignment.entity';
import { NumberingSequence } from '../modules/students/entities/numbering-sequence.entity';
import { Student } from '../modules/students/entities/student.entity';
import { Guardian } from '../modules/guardians/entities/guardian.entity';
import { StudentGuardian } from '../modules/guardians/entities/student-guardian.entity';
import { Admission } from '../modules/admissions/entities/admission.entity';
import { StudentEnrollment } from '../modules/enrollments/entities/student-enrollment.entity';
import { StudentDocument } from '../modules/student-documents/entities/student-document.entity';
import { Department } from '../modules/staff/entities/department.entity';
import { Designation } from '../modules/staff/entities/designation.entity';
import { Staff } from '../modules/staff/entities/staff.entity';
import { StaffDocument } from '../modules/staff/entities/staff-document.entity';
import { StudentAttendance } from '../modules/attendance/entities/student-attendance.entity';
import { StaffAttendance } from '../modules/attendance/entities/staff-attendance.entity';
import { LeaveType } from '../modules/attendance/entities/leave-type.entity';
import { LeaveRequest } from '../modules/attendance/entities/leave-request.entity';
import { Holiday } from '../modules/attendance/entities/holiday.entity';
import { FeeType } from '../modules/fees/entities/fee-type.entity';
import { FeeStructure } from '../modules/fees/entities/fee-structure.entity';
import { FeeStructureItem } from '../modules/fees/entities/fee-structure-item.entity';
import { FeeDiscount } from '../modules/fees/entities/fee-discount.entity';
import { StudentFeeAssignment } from '../modules/fees/entities/student-fee-assignment.entity';
import { FeeInvoice } from '../modules/fees/entities/fee-invoice.entity';
import { FeeInvoiceItem } from '../modules/fees/entities/fee-invoice-item.entity';
import { FeePayment } from '../modules/fees/entities/fee-payment.entity';
import { FeeLedger } from '../modules/fees/entities/fee-ledger.entity';
import { SalaryComponent } from '../modules/payroll/entities/salary-component.entity';
import { SalaryStructure } from '../modules/payroll/entities/salary-structure.entity';
import { SalaryStructureItem } from '../modules/payroll/entities/salary-structure-item.entity';
import { StaffSalaryAssignment } from '../modules/payroll/entities/staff-salary-assignment.entity';
import { Payroll } from '../modules/payroll/entities/payroll.entity';
import { PayrollItem } from '../modules/payroll/entities/payroll-item.entity';
import { SalaryPayment } from '../modules/payroll/entities/salary-payment.entity';
import { TreasuryAccount } from '../modules/treasury/entities/treasury-account.entity';
import { IncomeCategory } from '../modules/treasury/entities/income-category.entity';
import { IncomeTransaction } from '../modules/treasury/entities/income-transaction.entity';
import { ExpenseCategory } from '../modules/treasury/entities/expense-category.entity';
import { Expense } from '../modules/treasury/entities/expense.entity';
import { ExamType } from '../modules/exams/entities/exam-type.entity';
import { GradingScale } from '../modules/exams/entities/grading-scale.entity';
import { Exam } from '../modules/exams/entities/exam.entity';
import { ExamSchedule } from '../modules/exams/entities/exam-schedule.entity';
import { StudentMark } from '../modules/exams/entities/student-mark.entity';
import { ExamResult } from '../modules/exams/entities/exam-result.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'school_erp_db',
  entities: [
    Tenant,
    School,
    Branch,
    SchoolSettings,
    User,
    UserSession,
    Role,
    Permission,
    RolePermission,
    UserRole,
    RefreshToken,
    AuditLog,
    AcademicYear,
    ClassEntity,
    Section,
    Subject,
    ClassSubject,
    TeacherClassAssignment,
    TeacherSubjectAssignment,
    NumberingSequence,
    Student,
    Guardian,
    StudentGuardian,
    Admission,
    StudentEnrollment,
    StudentDocument,
    Department,
    Designation,
    Staff,
    StaffDocument,
    StudentAttendance,
    StaffAttendance,
    LeaveType,
    LeaveRequest,
    Holiday,
    FeeType,
    FeeStructure,
    FeeStructureItem,
    FeeDiscount,
    StudentFeeAssignment,
    FeeInvoice,
    FeeInvoiceItem,
    FeePayment,
    FeeLedger,
    SalaryComponent,
    SalaryStructure,
    SalaryStructureItem,
    StaffSalaryAssignment,
    Payroll,
    PayrollItem,
    SalaryPayment,
    TreasuryAccount,
    IncomeCategory,
    IncomeTransaction,
    ExpenseCategory,
    Expense,
    ExamType,
    GradingScale,
    Exam,
    ExamSchedule,
    StudentMark,
    ExamResult,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
