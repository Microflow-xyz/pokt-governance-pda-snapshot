import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Module({
  providers: [ScoringService],
})
export class ScoringModule {}
