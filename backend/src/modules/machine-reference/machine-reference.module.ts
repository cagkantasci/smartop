import { Module } from '@nestjs/common';
import { MachineReferenceController } from './machine-reference.controller';
import { MachineReferenceService } from './machine-reference.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MachineReferenceController],
  providers: [MachineReferenceService],
  exports: [MachineReferenceService],
})
export class MachineReferenceModule {}
