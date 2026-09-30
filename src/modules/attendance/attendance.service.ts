import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { StudentAttendance } from './entities/student-attendance.entity';
import { StaffAttendance } from './entities/staff-attendance.entity';
import {
  BulkSaveStudentAttendanceDto,
  StudentAttendanceQueryDto,
} from './dto/student-attendance.dto';
import {
  BulkSaveStaffAttendanceDto,
  StaffAttendanceQueryDto,
} from './dto/staff-attendance.dto';
import { AttendanceStatus } from '../../common/enums/status.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(StudentAttendance)
    private readonly studentAttRepo: Repository<StudentAttendance>,
    @InjectRepository(StaffAttendance)
    private readonly staffAttRepo: Repository<StaffAttendance>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ===================== STUDENT ATTENDANCE =====================

  async bulkSaveStudentAttendance(
    tenantId: string,
    schoolId: string,
    dto: BulkSaveStudentAttendanceDto,
    userId?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const results: StudentAttendance[] = [];

      for (const item of dto.records) {
        let existing = await manager.findOne(StudentAttendance, {
          where: {
            schoolId,
            studentId: item.studentId,
            attendanceDate: dto.attendanceDate,
            deletedAt: IsNull(),
          },
        });

        if (existing) {
          existing.status = item.status;
          existing.remarks = item.remarks;
          existing.markedBy = userId;
          existing.updatedBy = userId;
          results.push(await manager.save(StudentAttendance, existing));
        } else {
          const record = manager.create(StudentAttendance, {
            tenantId,
            schoolId,
            academicYearId: dto.academicYearId,
            classId: dto.classId,
            sectionId: dto.sectionId,
            studentId: item.studentId,
            attendanceDate: dto.attendanceDate,
            status: item.status,
            remarks: item.remarks,
            markedBy: userId,
            createdBy: userId,
            updatedBy: userId,
          });
          results.push(await manager.save(StudentAttendance, record));
        }
      }

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'UPDATE',
        module: 'attendance',
        entity: 'StudentAttendance',
        entityId: `${dto.sectionId}_${dto.attendanceDate}`,
        newValue: { count: results.length, date: dto.attendanceDate },
      });

      return results;
    });
  }

  async getStudentAttendance(schoolId: string, query: StudentAttendanceQueryDto) {
    const qb = this.studentAttRepo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.student', 'student')
      .leftJoinAndSelect('att.class', 'class')
      .leftJoinAndSelect('att.section', 'section')
      .where('att.school_id = :schoolId', { schoolId })
      .andWhere('att.deleted_at IS NULL');

    if (query.classId) {
      qb.andWhere('att.class_id = :classId', { classId: query.classId });
    }

    if (query.sectionId) {
      qb.andWhere('att.section_id = :sectionId', { sectionId: query.sectionId });
    }

    if (query.attendanceDate) {
      qb.andWhere('att.attendance_date = :attendanceDate', { attendanceDate: query.attendanceDate });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('att.attendance_date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    if (query.studentId) {
      qb.andWhere('att.student_id = :studentId', { studentId: query.studentId });
    }

    qb.orderBy('student.first_name', 'ASC');

    return qb.getMany();
  }

  // ===================== STAFF ATTENDANCE =====================

  async bulkSaveStaffAttendance(
    tenantId: string,
    schoolId: string,
    dto: BulkSaveStaffAttendanceDto,
    userId?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const results: StaffAttendance[] = [];

      for (const item of dto.records) {
        let existing = await manager.findOne(StaffAttendance, {
          where: {
            schoolId,
            staffId: item.staffId,
            attendanceDate: dto.attendanceDate,
            deletedAt: IsNull(),
          },
        });

        const checkIn = item.checkInTime ? new Date(item.checkInTime) : undefined;
        const checkOut = item.checkOutTime ? new Date(item.checkOutTime) : undefined;
        let workHours = 0;
        if (checkIn && checkOut) {
          workHours = Math.max(0, (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60));
        }

        if (existing) {
          existing.status = item.status;
          existing.checkInTime = checkIn || existing.checkInTime;
          existing.checkOutTime = checkOut || existing.checkOutTime;
          existing.workHours = workHours || existing.workHours;
          existing.isLate = item.isLate ?? existing.isLate;
          existing.isHalfDay = item.isHalfDay ?? existing.isHalfDay;
          existing.remarks = item.remarks;
          existing.markedBy = userId;
          existing.updatedBy = userId;
          results.push(await manager.save(StaffAttendance, existing));
        } else {
          const record = manager.create(StaffAttendance, {
            tenantId,
            schoolId,
            staffId: item.staffId,
            attendanceDate: dto.attendanceDate,
            status: item.status,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            workHours,
            isLate: item.isLate || false,
            isHalfDay: item.isHalfDay || false,
            remarks: item.remarks,
            markedBy: userId,
            createdBy: userId,
            updatedBy: userId,
          });
          results.push(await manager.save(StaffAttendance, record));
        }
      }

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'UPDATE',
        module: 'attendance',
        entity: 'StaffAttendance',
        entityId: dto.attendanceDate,
        newValue: { count: results.length, date: dto.attendanceDate },
      });

      return results;
    });
  }

  async getStaffAttendance(schoolId: string, query: StaffAttendanceQueryDto) {
    const qb = this.staffAttRepo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.staff', 'staff')
      .leftJoinAndSelect('staff.department', 'department')
      .leftJoinAndSelect('staff.designation', 'designation')
      .where('att.school_id = :schoolId', { schoolId })
      .andWhere('att.deleted_at IS NULL');

    if (query.departmentId) {
      qb.andWhere('staff.department_id = :deptId', { deptId: query.departmentId });
    }

    if (query.attendanceDate) {
      qb.andWhere('att.attendance_date = :attendanceDate', { attendanceDate: query.attendanceDate });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('att.attendance_date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    if (query.staffId) {
      qb.andWhere('att.staff_id = :staffId', { staffId: query.staffId });
    }

    qb.orderBy('staff.first_name', 'ASC');

    return qb.getMany();
  }

  async getAttendanceSummary(schoolId: string, date: string) {
    const studentPresent = await this.studentAttRepo.count({
      where: { schoolId, attendanceDate: date, status: AttendanceStatus.PRESENT, deletedAt: IsNull() },
    });
    const studentTotal = await this.studentAttRepo.count({
      where: { schoolId, attendanceDate: date, deletedAt: IsNull() },
    });

    const staffPresent = await this.staffAttRepo.count({
      where: { schoolId, attendanceDate: date, status: AttendanceStatus.PRESENT, deletedAt: IsNull() },
    });
    const staffTotal = await this.staffAttRepo.count({
      where: { schoolId, attendanceDate: date, deletedAt: IsNull() },
    });

    return {
      date,
      students: {
        present: studentPresent,
        total: studentTotal,
        percentage: studentTotal > 0 ? ((studentPresent / studentTotal) * 100).toFixed(1) : '0',
      },
      staff: {
        present: staffPresent,
        total: staffTotal,
        percentage: staffTotal > 0 ? ((staffPresent / staffTotal) * 100).toFixed(1) : '0',
      },
    };
  }
}
