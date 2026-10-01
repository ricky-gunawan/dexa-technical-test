import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AbsensiService } from './absensi/absensi.service';
import { AppController } from './app.controller';
import { DatabaseService } from './database/database.service';
import { PostgresDatabaseService } from './database/postgres-database.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MessageBrokerService } from './message-broker/message-broker.service';
import { RedisMessageBrokerService } from './message-broker/redis-message-broker.service';
import { UserService } from './user/user.service';
import { UserUpdateEventsService } from './user/user-update-events.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is required');
        return { secret, signOptions: { expiresIn: '1h' } };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: DatabaseService, useClass: PostgresDatabaseService },
    { provide: MessageBrokerService, useClass: RedisMessageBrokerService },
    UserUpdateEventsService,
    UserService,
    AbsensiService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
