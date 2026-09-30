export enum SalaryComponentType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
}

export enum SalaryCalculationType {
  FIXED = 'FIXED',
  PERCENTAGE_OF_BASIC = 'PERCENTAGE_OF_BASIC',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum SalaryPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}
