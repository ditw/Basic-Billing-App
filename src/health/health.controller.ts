import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application and memory health' })
  @ApiResponse({
    status: 200,
    description: 'Application memory heap is within healthy limits.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          example: { memory_heap: { status: 'up' } },
        },
        error: { type: 'object', example: {} },
        details: {
          type: 'object',
          example: { memory_heap: { status: 'up' } },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed (e.g., heap memory exceeded 250MB threshold).',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        info: { type: 'object', example: {} },
        error: {
          type: 'object',
          example: {
            memory_heap: {
              status: 'down',
              message: 'Used heap memory exceeds maximum allowed threshold',
            },
          },
        },
        details: {
          type: 'object',
          example: {
            memory_heap: {
              status: 'down',
              message: 'Used heap memory exceeds maximum allowed threshold',
            },
          },
        },
      },
    },
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Health check fails if heap memory usage exceeds 250MB (Just a use-case)
      () => this.memory.checkHeap('memory_heap', 250 * 1024 * 1024),
    ]);
  }
}
