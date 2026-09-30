import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExamType } from './entities/exam-type.entity';
import { GradingScale } from './entities/grading-scale.entity';
import { Exam } from './entities/exam.entity';
import { ExamSchedule } from './entities/exam-schedule.entity';
import { StudentMark } from './entities/student-mark.entity';
import { ExamResult } from './entities/exam-result.entity';
import { Student } from '../students/entities/student.entity';
import { StudentEnrollment } from '../enrollments/entities/student-enrollment.entity';
import { EnrollmentStatus } from '../../common/enums/status.enum';
import { StudentAttendance } from '../attendance/entities/student-attendance.entity';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { CreateGradingScaleDto } from './dto/create-grading-scale.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { SubmitMarksDto } from './dto/submit-marks.dto';
import { CalculateResultsDto } from './dto/calculate-results.dto';
import { ExamStatus, StudentMarkStatus, ResultStatus, ExamScheduleStatus } from './exams.enums';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(ExamType)
    private readonly examTypeRepo: Repository<ExamType>,
    @InjectRepository(GradingScale)
    private readonly gradingScaleRepo: Repository<GradingScale>,
    @InjectRepository(Exam)
    private readonly examRepo: Repository<Exam>,
    @InjectRepository(ExamSchedule)
    private readonly scheduleRepo: Repository<ExamSchedule>,
    @InjectRepository(StudentMark)
    private readonly markRepo: Repository<StudentMark>,
    @InjectRepository(ExamResult)
    private readonly resultRepo: Repository<ExamResult>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(StudentAttendance)
    private readonly studentAttendanceRepo: Repository<StudentAttendance>,
  ) {}

  // ==========================================
  // 1. EXAM TYPES
  // ==========================================
  async getExamTypes(tenantId: string): Promise<ExamType[]> {
    return this.examTypeRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async createExamType(tenantId: string, dto: CreateExamTypeDto): Promise<ExamType> {
    const existing = await this.examTypeRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Exam type with code ${dto.code} already exists.`);
    }

    const examType = this.examTypeRepo.create({
      ...dto,
      tenantId,
    });
    return this.examTypeRepo.save(examType);
  }

  // ==========================================
  // 2. GRADING SCALES
  // ==========================================
  async getGradingScales(tenantId: string): Promise<GradingScale[]> {
    return this.gradingScaleRepo.find({
      where: { tenantId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createGradingScale(tenantId: string, dto: CreateGradingScaleDto): Promise<GradingScale> {
    if (dto.isDefault) {
      await this.gradingScaleRepo.update({ tenantId, isDefault: true }, { isDefault: false });
    }

    const scale = this.gradingScaleRepo.create({
      ...dto,
      tenantId,
    });
    return this.gradingScaleRepo.save(scale);
  }

  private resolveGrade(scorePercentage: number, ranges: any[]): { grade: string; gpaPoint?: number; remarks?: string } {
    if (!ranges || ranges.length === 0) {
      if (scorePercentage >= 90) return { grade: 'A+', gpaPoint: 4.0, remarks: 'Outstanding' };
      if (scorePercentage >= 80) return { grade: 'A', gpaPoint: 3.7, remarks: 'Excellent' };
      if (scorePercentage >= 70) return { grade: 'B', gpaPoint: 3.0, remarks: 'Very Good' };
      if (scorePercentage >= 60) return { grade: 'C', gpaPoint: 2.0, remarks: 'Good' };
      if (scorePercentage >= 50) return { grade: 'D', gpaPoint: 1.0, remarks: 'Satisfactory' };
      return { grade: 'F', gpaPoint: 0.0, remarks: 'Fail' };
    }

    for (const r of ranges) {
      if (scorePercentage >= Number(r.minScore) && scorePercentage <= Number(r.maxScore)) {
        return {
          grade: r.grade,
          gpaPoint: r.gpaPoint !== undefined ? Number(r.gpaPoint) : undefined,
          remarks: r.remarks,
        };
      }
    }
    return { grade: 'F', gpaPoint: 0.0, remarks: 'Fail' };
  }

  // ==========================================
  // 3. EXAMS
  // ==========================================
  async getExams(
    tenantId: string,
    query?: { academicYearId?: string; status?: string; page?: number; limit?: number },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (query?.academicYearId) where.academicYearId = query.academicYearId;
    if (query?.status) where.status = query.status;

    const [items, total] = await this.examRepo.findAndCount({
      where,
      relations: {
        academicYear: true,
        examType: true,
        gradingScale: true,
        schedules: {
          class: true,
          section: true,
          subject: true,
        },
      },
      order: { startDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExamById(tenantId: string, id: string): Promise<Exam> {
    const exam = await this.examRepo.findOne({
      where: { id, tenantId },
      relations: {
        academicYear: true,
        examType: true,
        gradingScale: true,
        schedules: {
          class: true,
          section: true,
          subject: true,
          invigilatorStaff: true,
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async createExam(tenantId: string, dto: CreateExamDto): Promise<Exam> {
    const exam = this.examRepo.create({
      ...dto,
      tenantId,
      status: dto.status || ExamStatus.SCHEDULED,
    });
    return this.examRepo.save(exam);
  }

  async updateExamStatus(tenantId: string, id: string, status: ExamStatus): Promise<Exam> {
    const exam = await this.getExamById(tenantId, id);
    exam.status = status;
    return this.examRepo.save(exam);
  }

  // ==========================================
  // 4. EXAM SCHEDULES
  // ==========================================
  async getSchedules(tenantId: string, examId: string, classId?: string, sectionId?: string) {
    const where: any = { tenantId, examId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;

    return this.scheduleRepo.find({
      where,
      relations: {
        class: true,
        section: true,
        subject: true,
        invigilatorStaff: true,
      },
      order: { examDate: 'ASC', startTime: 'ASC' },
    });
  }

  async createSchedule(tenantId: string, dto: CreateExamScheduleDto): Promise<ExamSchedule> {
    const schedule = this.scheduleRepo.create({
      ...dto,
      tenantId,
      status: ExamScheduleStatus.SCHEDULED,
    });
    return this.scheduleRepo.save(schedule);
  }

  // ==========================================
  // 5. MARKS ENTRY
  // ==========================================
  async getMarksBySchedule(tenantId: string, examScheduleId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: examScheduleId, tenantId },
      relations: {
        exam: { gradingScale: true },
        class: true,
        section: true,
        subject: true,
      },
    });
    if (!schedule) throw new NotFoundException('Exam schedule not found');

    // Fetch existing marks
    const marks = await this.markRepo.find({
      where: { examScheduleId, tenantId },
      relations: { student: true, evaluatedByStaff: true },
    });

    // Fetch all active enrolled students in this class/section
    const enrollmentWhere: any = {
      tenantId,
      classId: schedule.classId,
      status: EnrollmentStatus.ACTIVE,
    };
    if (schedule.sectionId) enrollmentWhere.sectionId = schedule.sectionId;

    const enrollments = await this.enrollmentRepo.find({
      where: enrollmentWhere,
      relations: { student: true },
      order: { rollNumber: 'ASC' },
    });

    // Map student marks with fallback
    const marksMap = new Map<string, StudentMark>();
    marks.forEach((m) => marksMap.set(m.studentId, m));

    const roster = enrollments.map((en) => {
      const s = en.student;
      const existing = marksMap.get(s.id);
      return {
        studentId: s.id,
        student: {
          id: s.id,
          admissionNumber: s.admissionNumber || s.studentCode,
          rollNumber: en.rollNumber || '-',
          firstName: s.firstName,
          lastName: s.lastName,
          gender: s.gender,
          photoUrl: s.photoUrl,
        },
        markId: existing?.id || null,
        theoryMarks: existing ? Number(existing.theoryMarks) : 0,
        practicalMarks: existing ? Number(existing.practicalMarks) : 0,
        internalMarks: existing ? Number(existing.internalMarks) : 0,
        totalMarks: existing ? Number(existing.totalMarks) : 0,
        grade: existing?.grade || '-',
        gpaPoint: existing?.gpaPoint !== undefined ? Number(existing.gpaPoint) : null,
        isAbsent: existing?.isAbsent || false,
        remarks: existing?.remarks || '',
        status: existing?.status || StudentMarkStatus.DRAFT,
      };
    });

    return {
      schedule,
      roster,
    };
  }

  async submitMarks(tenantId: string, staffId: string | undefined, dto: SubmitMarksDto) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.examScheduleId, tenantId },
      relations: { exam: { gradingScale: true } },
    });
    if (!schedule) throw new NotFoundException('Exam schedule not found');

    const gradingRanges = schedule.exam?.gradingScale?.ranges || [];

    const savedMarks: StudentMark[] = [];
    for (const item of dto.marks) {
      let mark = await this.markRepo.findOne({
        where: { examScheduleId: dto.examScheduleId, studentId: item.studentId, tenantId },
      });

      const theory = Number(item.theoryMarks || 0);
      const practical = Number(item.practicalMarks || 0);
      const internal = Number(item.internalMarks || 0);
      const isAbsent = Boolean(item.isAbsent);

      const total = isAbsent ? 0 : theory + practical + internal;
      const scorePct = schedule.maxMarks > 0 ? (total / Number(schedule.maxMarks)) * 100 : 0;
      const { grade, gpaPoint } = isAbsent ? { grade: 'AB', gpaPoint: 0 } : this.resolveGrade(scorePct, gradingRanges);

      if (!mark) {
        mark = this.markRepo.create({
          tenantId,
          examScheduleId: dto.examScheduleId,
          studentId: item.studentId,
          theoryMarks: theory,
          practicalMarks: practical,
          internalMarks: internal,
          totalMarks: total,
          grade,
          gpaPoint,
          isAbsent,
          remarks: item.remarks,
          status: dto.status || StudentMarkStatus.SUBMITTED,
          evaluatedByStaffId: staffId,
        });
      } else {
        mark.theoryMarks = theory;
        mark.practicalMarks = practical;
        mark.internalMarks = internal;
        mark.totalMarks = total;
        mark.grade = grade;
        mark.gpaPoint = gpaPoint;
        mark.isAbsent = isAbsent;
        mark.remarks = item.remarks;
        mark.status = dto.status || StudentMarkStatus.SUBMITTED;
        if (staffId) mark.evaluatedByStaffId = staffId;
      }

      savedMarks.push(await this.markRepo.save(mark));
    }

    return {
      message: `Successfully processed ${savedMarks.length} student marks.`,
      count: savedMarks.length,
    };
  }

  // ==========================================
  // 6. RESULT CALCULATION & REPORT CARD ENGINE
  // ==========================================
  async calculateExamResults(tenantId: string, dto: CalculateResultsDto) {
    const exam = await this.examRepo.findOne({
      where: { id: dto.examId, tenantId },
      relations: {
        gradingScale: true,
        schedules: {
          subject: true,
          marks: true,
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    const gradingRanges = exam.gradingScale?.ranges || [];

    // Filter schedules by class/section if requested
    let schedules = exam.schedules || [];
    if (dto.classId) schedules = schedules.filter((s) => s.classId === dto.classId);
    if (dto.sectionId) schedules = schedules.filter((s) => s.sectionId === dto.sectionId);

    if (schedules.length === 0) {
      throw new BadRequestException('No exam schedules found for this exam selection.');
    }

    // Collect all schedule IDs
    const scheduleIds = schedules.map((s) => s.id);
    const allMarks = await this.markRepo.find({
      where: { examScheduleId: In(scheduleIds), tenantId },
      relations: { student: true, examSchedule: true },
    });

    // Group marks by student
    const studentMarksMap = new Map<string, StudentMark[]>();
    allMarks.forEach((m) => {
      const list = studentMarksMap.get(m.studentId) || [];
      list.push(m);
      studentMarksMap.set(m.studentId, list);
    });

    const calculatedResults: ExamResult[] = [];

    // For each student, aggregate scores
    for (const [studentId, marks] of studentMarksMap.entries()) {
      let totalMaxMarks = 0;
      let totalMarksObtained = 0;
      let failedSubjectCount = 0;

      for (const m of marks) {
        const sched = schedules.find((s) => s.id === m.examScheduleId);
        const maxM = Number(sched?.maxMarks || 100);
        const passM = Number(sched?.passMarks || 35);
        const obtM = Number(m.totalMarks || 0);

        totalMaxMarks += maxM;
        totalMarksObtained += obtM;

        if (m.isAbsent || obtM < passM) {
          failedSubjectCount++;
        }
      }

      const percentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
      const { grade: overallGrade, gpaPoint: gpa } = this.resolveGrade(percentage, gradingRanges);

      let resultStatus = ResultStatus.PASSED;
      if (failedSubjectCount === 1) {
        resultStatus = ResultStatus.COMPARTMENT;
      } else if (failedSubjectCount > 1) {
        resultStatus = ResultStatus.FAILED;
      }

      const sampleStudent = marks[0]?.student;
      const classId = marks[0]?.examSchedule?.classId || dto.classId || '';
      const sectionId = marks[0]?.examSchedule?.sectionId || dto.sectionId || undefined;

      // Compute student attendance percentage
      let attendancePct: number | undefined = undefined;
      const attendanceRecords = await this.studentAttendanceRepo.find({
        where: { studentId, tenantId },
      });
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
        attendancePct = Number(((presentCount / attendanceRecords.length) * 100).toFixed(1));
      }

      let resultRecord = await this.resultRepo.findOne({
        where: { examId: dto.examId, studentId, tenantId },
      });

      if (!resultRecord) {
        resultRecord = this.resultRepo.create({
          tenantId,
          examId: dto.examId,
          studentId,
          academicYearId: exam.academicYearId,
          classId,
          sectionId,
          totalMaxMarks,
          totalMarksObtained,
          percentage,
          gpa,
          overallGrade,
          resultStatus,
          attendancePercentage: attendancePct,
          teacherRemarks: dto.generalRemarks || 'Evaluation completed.',
        });
      } else {
        resultRecord.totalMaxMarks = totalMaxMarks;
        resultRecord.totalMarksObtained = totalMarksObtained;
        resultRecord.percentage = percentage;
        resultRecord.gpa = gpa;
        resultRecord.overallGrade = overallGrade;
        resultRecord.resultStatus = resultStatus;
        resultRecord.attendancePercentage = attendancePct;
        if (dto.generalRemarks) resultRecord.teacherRemarks = dto.generalRemarks;
      }

      calculatedResults.push(resultRecord);
    }

    // Sort by percentage descending and assign ranks
    calculatedResults.sort((a, b) => Number(b.percentage) - Number(a.percentage));
    calculatedResults.forEach((res, idx) => {
      res.rank = idx + 1;
    });

    await this.resultRepo.save(calculatedResults);

    return {
      message: `Calculated exam results for ${calculatedResults.length} students.`,
      count: calculatedResults.length,
    };
  }

  async getExamResults(tenantId: string, examId: string, classId?: string, sectionId?: string) {
    const where: any = { tenantId, examId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;

    return this.resultRepo.find({
      where,
      relations: {
        student: true,
        class: true,
        section: true,
        academicYear: true,
      },
      order: { rank: 'ASC', percentage: 'DESC' },
    });
  }

  async getStudentReportCard(tenantId: string, examId: string, studentId: string) {
    const result = await this.resultRepo.findOne({
      where: { examId, studentId, tenantId },
      relations: {
        student: true,
        class: true,
        section: true,
        academicYear: true,
        exam: {
          examType: true,
          gradingScale: true,
        },
      },
    });
    if (!result) throw new NotFoundException('Report card not found for this student and exam.');

    // Fetch all schedules and marks for this exam and student
    const schedules = await this.scheduleRepo.find({
      where: { examId, classId: result.classId, tenantId },
      relations: { subject: true },
      order: { examDate: 'ASC' },
    });

    const scheduleIds = schedules.map((s) => s.id);
    const marks = await this.markRepo.find({
      where: { examScheduleId: In(scheduleIds), studentId, tenantId },
    });

    const marksMap = new Map<string, StudentMark>();
    marks.forEach((m) => marksMap.set(m.examScheduleId, m));

    const subjectBreakdown = schedules.map((sch) => {
      const m = marksMap.get(sch.id);
      const maxM = Number(sch.maxMarks || 100);
      const passM = Number(sch.passMarks || 35);
      const obtM = m ? Number(m.totalMarks) : 0;
      const isPassed = !m?.isAbsent && obtM >= passM;

      return {
        subjectCode: sch.subject?.code || '',
        subjectName: sch.subject?.name || 'Subject',
        theoryMax: Number(sch.theoryMaxMarks || 80),
        practicalMax: Number(sch.practicalMaxMarks || 20),
        theoryObtained: m ? Number(m.theoryMarks) : 0,
        practicalObtained: m ? Number(m.practicalMarks) : 0,
        internalObtained: m ? Number(m.internalMarks) : 0,
        totalMax: maxM,
        passMarks: passM,
        totalObtained: obtM,
        grade: m?.grade || '-',
        isAbsent: m?.isAbsent || false,
        isPassed,
        remarks: m?.remarks || '',
      };
    });

    return {
      result,
      subjects: subjectBreakdown,
      gradingScale: result.exam?.gradingScale?.ranges || [],
    };
  }

  async publishResults(tenantId: string, examId: string) {
    const exam = await this.getExamById(tenantId, examId);
    exam.status = ExamStatus.RESULTS_PUBLISHED;
    await this.examRepo.save(exam);

    await this.resultRepo.update(
      { examId, tenantId },
      { publishedAt: new Date() },
    );

    return {
      message: 'Exam results published successfully.',
      examId,
    };
  }
}
