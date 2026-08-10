import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrenciesService } from '@app/currencies/services/currencies.service';
import { CreateCurrencyDto } from '@app/currencies/dto/create-currency.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new currency record' })
  @ApiResponse({ status: 201, description: 'Currency successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation error in request body.' })
  @ApiResponse({ status: 409, description: 'Currency code already exists.' })
  createCurrency(@Body() dto: CreateCurrencyDto) {
    return this.currenciesService.create(dto);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Retrieve currency by ISO code' })
  @ApiParam({ name: 'code', example: 'USD', description: 'Currency ISO code' })
  @ApiResponse({ status: 200, description: 'Currency retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Currency not found.' })
  getCurrency(@Param('code') code: string) {
    return this.currenciesService.findByCode(code);
  }
}
