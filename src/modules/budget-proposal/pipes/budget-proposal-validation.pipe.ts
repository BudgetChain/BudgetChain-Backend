import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer'; // Use plainToInstance instead of deprecated plainToClass

@Injectable()
export class BudgetProposalValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Safely convert plain object to class instance
    const object = plainToInstance(metatype as new () => object, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.flatMap(err => {
        if (err.constraints) {
          return Object.values(err.constraints);
        }
        return [];
      });
      throw new BadRequestException(errorMessages);
    }

    // Custom validation: Safely access startDate and endDate
    const hasStartDate = Object.prototype.hasOwnProperty.call(
      object,
      'startDate'
    ) as string;
    const hasEndDate = Object.prototype.hasOwnProperty.call(
      object,
      'endDate'
    ) as string;

    if (hasStartDate && hasEndDate) {
      const start = new Date(
        (object as Record<string, unknown>)['startDate'] as string
      );
      const end = new Date(
        (object as Record<string, unknown>)['endDate'] as string
      );
      if (start >= end) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return value;
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !(types as unknown[]).includes(metatype);
  }
}
