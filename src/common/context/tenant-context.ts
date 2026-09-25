import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId?: string;
  schoolId?: string;
  branchId?: string;
  userId?: string;
}

export class TenantContext {
  private static readonly storage = new AsyncLocalStorage<TenantContextData>();

  static run<T>(data: TenantContextData, callback: () => T): T {
    return this.storage.run(data, callback);
  }

  static getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  static getSchoolId(): string | undefined {
    return this.storage.getStore()?.schoolId;
  }

  static getBranchId(): string | undefined {
    return this.storage.getStore()?.branchId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  static getContext(): TenantContextData | undefined {
    return this.storage.getStore();
  }
}
