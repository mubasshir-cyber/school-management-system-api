import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the response is already in ApiResponse format, return as is
        if (res && typeof res === 'object' && 'success' in res) {
          return res;
        }

        // Handle paginated responses
        if (res && typeof res === 'object' && 'items' in res && 'meta' in res) {
          return {
            success: true,
            message: 'Data retrieved successfully',
            data: res.items,
            meta: res.meta,
          };
        }

        return {
          success: true,
          message: 'Operation successful',
          data: res ?? null,
        };
      }),
    );
  }
}
