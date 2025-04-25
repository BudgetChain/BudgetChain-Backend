import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import configuration from './configuration';

type Config = ConfigType<typeof configuration>;

@Injectable()
export class ConfigService {
  constructor(
    private readonly nestConfigService: NestConfigService<Config, true>
  ) {}

  get<T extends keyof Config>(propertyPath: T): Config[T] {
    return this.nestConfigService.get(propertyPath, { infer: true });
  }

  getOrThrow<T extends keyof Config>(propertyPath: T): Config[T] {
    return this.nestConfigService.getOrThrow(propertyPath, { infer: true });
  }
}
