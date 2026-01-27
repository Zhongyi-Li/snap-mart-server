import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { successResponse } from './common/dto/response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return successResponse({ status: 'ok' }, 'ok', 200);
  }
}
