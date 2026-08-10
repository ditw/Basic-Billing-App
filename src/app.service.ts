import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppInfo {
  service: string;
  status: string;
  version: string;
  documentation: string;
  apiPrefix: string;
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getAppInfo(): AppInfo {
    const globalPrefix = this.configService.get<string>('GLOBAL_PREFIX') || '';

    return {
      service: 'basic-billing-app',
      status: 'online',
      version: '1.0.0',
      documentation: '/api',
      apiPrefix: globalPrefix,
    };
  }
}
