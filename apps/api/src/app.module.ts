import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BriefsModule } from './briefs/briefs.module';
import { dataSourceOptions } from './database/data-source';
import { ProjectsModule } from './projects/projects.module';

@Controller('health')
class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...dataSourceOptions,
        url: config.getOrThrow<string>('DATABASE_URL'),
        migrationsRun: true, // apply pending migrations on startup
      }),
    }),
    AuthModule,
    BriefsModule,
    ProjectsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
