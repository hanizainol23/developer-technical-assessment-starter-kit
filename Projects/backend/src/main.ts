import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      xssFilter: true,
      noSniff: true,
    }),
  );

  // Cookie parser for HTTP-only cookie JWT
  app.use(cookieParser());

  // CORS with strict origin whitelist
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Rate limiting with stricter defaults
  const limiter = (rateLimit as any)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Stricter rate limit for auth endpoints
  const authLimiter = (rateLimit as any)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.',
  });
  app.use('/auth/login', authLimiter);
  app.use('/auth/register', authLimiter);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`✓ Server listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`✓ CORS enabled for: ${allowedOrigins.join(', ')}`);
  // eslint-disable-next-line no-console
  console.log(`✓ HTTP-only cookies enabled for JWT`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap error:', err);
  process.exit(1);
});
