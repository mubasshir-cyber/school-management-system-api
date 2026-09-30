import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { SalaryComponent } from './entities/salary-component.entity';
import { SalaryStructure } from './entities/salary-structure.entity';
import { SalaryStructureItem } from './entities/salary-structure-item.entity';
import { StaffSalaryAssignment } from './entities/staff-salary-assignment.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItem } from './entities/payroll-item.entity';
import { SalaryPayment } from './entities/salary-payment.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffAttendance } from '../attendance/entities/staff-attendance.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaryComponent,
      SalaryStructure,
      SalaryStructureItem,
      StaffSalaryAssignment,
      Payroll,
      PayrollItem,
      SalaryPayment,
      Staff,
      StaffAttendance,
    ]),
    AuditModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
