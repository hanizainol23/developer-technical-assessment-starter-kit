import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    try {
      if (!this.isValidEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }

      this.validatePassword(password);

      const existing = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
      if (existing) {
        this.logger.warn(`Registration attempt with existing email: ${email}`);
        throw new BadRequestException('Email already registered');
      }

      const hash = await bcrypt.hash(password, 10);
      const user = this.usersRepo.create({
        email: email.toLowerCase(),
        passwordHash: hash,
        name,
        role: 'user',
      });
      const savedUser = await this.usersRepo.save(user);
      this.logger.log(`User registered: ${email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        this.logger.warn(`Login attempt with inactive user: ${email}`);
        throw new UnauthorizedException('Account is inactive');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      user.last_login = new Date();
      await this.usersRepo.save(user);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret';
    const token = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '1h',
      algorithm: 'HS256',
    });
    return { token };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }
  }
}
