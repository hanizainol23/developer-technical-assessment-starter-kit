import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { PropertiesModule } from './properties/properties.module';
import { ContactsModule } from './contacts/contacts.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { LandsModule } from './lands/lands.module';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
      autoLoadEntities: true,
      synchronize: false,
      retryAttempts: 1,
      retryDelay: 1000
    }),
    DatabaseModule,
    PropertiesModule,
    ProjectsModule,
    LandsModule,
    ContactsModule,
    AuthModule,
    ListingsModule,
    // Agent contacts (protected)
    // Register repository via module
    require('./agent-contacts/agent-contacts.module').AgentContactsModule,
    // Health endpoint for readiness/liveness checks
    require('./health/health.module').HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
