import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiBearerAuth } from '@nestjs/swagger';
import { BloodStockService } from './blood-stock.service.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';
import { CreateShortageAlertDto } from './dto/create-shortage-alert.dto.js';
import { DeviceAuthGuard } from '../common/guards/device-auth.guard.js';
import { CurrentDevice } from '../common/decorators/current-device.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Blood Stock')
@Controller('blood-stock')
export class BloodStockController {
  constructor(private readonly bloodStockService: BloodStockService) {}

  @Put()
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Update stock for a blood type' })
  async updateStock(@CurrentDevice() bank: any, @Body() dto: UpdateStockDto) {
    return this.bloodStockService.updateStock(bank.id, dto);
  }

  @Get('bank/:bankId')
  @ApiOperation({ summary: 'Get stock levels for a bank' })
  async getStockByBank(@Param('bankId') bankId: string) {
    return this.bloodStockService.getStockByBank(bankId);
  }

  @Post('shortage-alert')
  @UseGuards(DeviceAuthGuard)
  @ApiSecurity('device-id')
  @ApiSecurity('user-type')
  @ApiOperation({ summary: 'Create shortage alert' })
  async createAlert(@CurrentDevice() bank: any, @Body() dto: CreateShortageAlertDto) {
    return this.bloodStockService.createShortageAlert(bank.id, dto);
  }

  @Get('shortage-alerts')
  @ApiOperation({ summary: 'List active shortage alerts' })
  async getActiveAlerts(@Query() query: PaginationQueryDto) {
    return this.bloodStockService.getActiveAlerts(query.page, query.limit);
  }

  @Patch('shortage-alerts/:id/resolve')
  @ApiOperation({ summary: 'Mark shortage alert as resolved' })
  async resolveAlert(@Param('id') id: string) {
    return this.bloodStockService.resolveAlert(id);
  }
}
