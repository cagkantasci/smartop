import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { MachinesModule } from './modules/machines/machines.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EventsModule } from './modules/events/events.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MachinesModule,
    ChecklistsModule,
    JobsModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
