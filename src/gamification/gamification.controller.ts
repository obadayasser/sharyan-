import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamificationService } from './gamification.service.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top donors by points' })
  async getLeaderboard(@Query() query: PaginationQueryDto) {
    return this.gamificationService.getLeaderboard(query.page, query.limit);
  }

  @Get('badges')
  @ApiOperation({ summary: 'List all available badges' })
  async getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  @Get('donor/:donorId/summary')
  @ApiOperation({ summary: 'Get donor gamification summary' })
  async getDonorSummary(@Param('donorId') donorId: string) {
    return this.gamificationService.getDonorSummary(donorId);
  }
}
