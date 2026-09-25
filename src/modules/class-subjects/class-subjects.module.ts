import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSubject } from './entities/class-subject.entity';
import { ClassSubjectsService } from './class-subjects.service';
import { ClassSubjectsController } from './class-subjects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSubject])],
  controllers: [ClassSubjectsController],
  providers: [ClassSubjectsService],
  exports: [ClassSubjectsService, TypeOrmModule],
})
export class ClassSubjectsModule {}
