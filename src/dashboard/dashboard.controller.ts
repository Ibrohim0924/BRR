import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('monthly-report')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiResponse({ status: 200, description: 'Monthly report retrieved successfully' })
  async getMonthlyReport(
    @Query('year') year: number = new Date().getFullYear(),
    @Query('month') month: number = new Date().getMonth() + 1,
  ) {
    return this.dashboardService.getMonthlyReport(+year, +month);
  }
}