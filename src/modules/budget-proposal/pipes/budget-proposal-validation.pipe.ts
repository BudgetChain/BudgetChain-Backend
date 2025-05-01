import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateBudgetProposalDto } from '../entities/dto/create-budget-proposal.dto';

@Injectable()
export class BudgetProposalValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => {
          if (err.constraints) {
            return Object.values(err.constraints);
          }
          return [];
        })
        .flat();
      throw new BadRequestException(errorMessages);
    }

    // Additional custom validation
    if (object.startDate && object.endDate) {
      const start = new Date(object.startDate);
      const end = new Date(object.endDate);
      if (start >= end) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
