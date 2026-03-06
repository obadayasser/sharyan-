import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminDto } from './dto/update-admin.dto.js';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('admins')
  @ApiOperation({ summary: 'List all admins' })
  async findAllAdmins(@Query() query: PaginationQueryDto) {
    return this.adminService.findAll(query.page, query.limit);
  }

  @Post('admins')
  @ApiOperation({ summary: 'Create new admin' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Patch('admins/:id')
  @ApiOperation({ summary: 'Update admin' })
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Deactivate admin' })
  async removeAdmin(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  @Get('donors')
  @ApiOperation({ summary: 'List all donors' })
  async getAllDonors(@Query() query: PaginationQueryDto) {
    return this.adminService.getAllDonors(query.page, query.limit);
  }

  @Get('patients')
  @ApiOperation({ summary: 'List all patients' })
  async getAllPatients(@Query() query: PaginationQueryDto) {
    return this.adminService.getAllPatients(query.page, query.limit);
  }

  @Get('blood-requests')
  @ApiOperation({ summary: 'List all blood requests' })
  async getAllBloodRequests(@Query() query: PaginationQueryDto) {
    return this.adminService.getAllBloodRequests(query.page, query.limit);
  }

  @Patch('donors/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle donor active status' })
  async toggleDonorActive(@Param('id') id: string) {
    return this.adminService.toggleDonorActive(id);
  }

  @Patch('patients/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle patient active status' })
  async togglePatientActive(@Param('id') id: string) {
    return this.adminService.togglePatientActive(id);
  }
}
