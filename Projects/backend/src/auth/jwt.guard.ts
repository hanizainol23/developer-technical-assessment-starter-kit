import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    
    // Try HTTP-only cookie first, then Authorization header
    const token = req.cookies?.authentication || this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret';
      const payload = this.jwtService.verify(token, { secret: jwtSecret });
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;

    const [scheme, credentials] = authHeader.split(' ');
    if (scheme.toLowerCase() !== 'bearer') return undefined;

    return credentials;
  }
}
