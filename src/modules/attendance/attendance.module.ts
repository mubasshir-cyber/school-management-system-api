import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentAttendance } from './entities/student-attendance.entity';
import { StaffAttendance } from './entities/staff-attendance.entity';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { Holiday } from './entities/holiday.entity';

import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentAttendance,
      StaffAttendance,
      LeaveType,
      LeaveRequest,
      Holiday,
    ]),
    AuditModule,
  ],
  controllers: [
    AttendanceController,
    LeaveController,
    HolidayController,
  ],
  providers: [
    AttendanceService,
    LeaveService,
    HolidayService,
  ],
  exports: [
    AttendanceService,
    LeaveService,
    HolidayService,
  ],
})
export class AttendanceModule {}
