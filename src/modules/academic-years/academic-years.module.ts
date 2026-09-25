import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService],
  exports: [AcademicYearsService, TypeOrmModule],
})
export class AcademicYearsModule {}
