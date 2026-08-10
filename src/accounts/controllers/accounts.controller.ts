import { Controller, Post, Body, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation error in request body.' })
  @ApiResponse({ status: 409, description: 'Account ID already exists.' })
  createAccount(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve account details by account ID' })
  @ApiParam({ name: 'id', example: 'account-001', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account details retrieved.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  getAccount(@Param('id') id: string) {
    return this.accountsService.findById(id);
  }
}
