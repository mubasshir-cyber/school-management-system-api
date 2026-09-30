import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Payroll } from './payroll.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { SalaryPayment } from './salary-payment.entity';

@Entity('payroll_items')
export class PayrollItem extends BaseEntity {
  @Column({ name: 'payroll_id', type: 'uuid' })
  payrollId: string;

  @ManyToOne(() => Payroll, (p) => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'basic_salary', type: 'numeric', precision: 12, scale: 2, default: 0 })
  basicSalary: number;

  @Column({ name: 'total_earnings', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ name: 'total_deductions', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ name: 'unpaid_leaves_count', type: 'numeric', precision: 4, scale: 1, default: 0 })
  unpaidLeavesCount: number;

  @Column({ name: 'lop_deduction_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  lopDeductionAmount: number;

  @Column({ name: 'net_salary', type: 'numeric', precision: 12, scale: 2, default: 0 })
  netSalary: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown?: {
    earnings: { name: string; amount: number }[];
    deductions: { name: string; amount: number }[];
  };

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => SalaryPayment, (sp) => sp.payrollItem)
  payments?: SalaryPayment[];
}
