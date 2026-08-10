import { Controller, Get, Redirect } from '@nestjs/common';
import { type AppInfo, AppService } from '@app/app.service';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Redirect('/api', 302)
  redirectToSwagger() {}

  @Get('v1')
  @ApiOperation({ summary: 'Get application metadata' })
  @ApiResponse({ status: 200, description: 'Returns service info.' })
  getAppInfo(): AppInfo {
    return this.appService.getAppInfo();
  }
}
