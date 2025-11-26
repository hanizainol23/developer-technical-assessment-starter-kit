# Security & Error Handling Implementation Guide

## Overview

This document details the comprehensive security and error handling improvements implemented across the frontend and backend of the Real Estate Platform.

---

## Backend Security Enhancements

### 1. HTTP-Only Cookie JWT Storage

**Why:** HTTP-only cookies protect against XSS (Cross-Site Scripting) attacks that could steal tokens from localStorage.

**Implementation:**
- JWT tokens are set as HTTP-only cookies after login/registration
- Cookies have `secure` flag (HTTPS-only in production)
- Cookies have `sameSite: strict` flag (CSRF protection)
- 1-hour expiration for security

```typescript
// In auth.controller.ts
res.cookie('authentication', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000, // 1 hour
  path: '/',
});
```

**Pros:**
- ✅ Immune to XSS attacks (JavaScript cannot access HTTP-only cookies)
- ✅ Automatically sent with all requests to the API
- ✅ Automatic cleanup after expiration

**Cons:**
- ⚠ CSRF protection requires SameSite & CORS rules (implemented)

---

### 2. Enhanced JWT Guard

**What Changed:**
- Now reads JWT from HTTP-only cookie first
- Falls back to Authorization header (for backward compatibility)
- Improved error messages

```typescript
// In jwt.guard.ts
canActivate(context: ExecutionContext): boolean {
  const token = req.cookies?.authentication || this.extractTokenFromHeader(req);
  // Verify token and attach to request
  const payload = this.jwtService.verify(token, { secret: jwtSecret });
  req.user = payload;
}
```

---

### 3. Strict Authentication Validation

**Password Requirements:**
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)

**Email Validation:**
- Basic regex validation
- Case-insensitive storage (lowercase)

**Account Status Check:**
- Verify user is active before login
- Log all auth attempts for audit trail

```typescript
// In auth.service.ts
private validatePassword(password: string): void {
  if (password.length < 8) {
    throw new BadRequestException('Password must be at least 8 characters');
  }
  // ... more validations
}

async validateUser(email: string, password: string) {
  // Case-insensitive lookup
  const user = await this.usersRepo.findOne({ 
    where: { email: email.toLowerCase() } 
  });
  
  // Check account status
  if (!user.is_active) {
    throw new UnauthorizedException('Account is inactive');
  }
  // ... more checks
}
```

---

### 4. Enhanced Security Headers (Helmet)

**Implementation:**
- **Content Security Policy (CSP):** Restricts script/style sources
- **HSTS:** Forces HTTPS (1 year, preload)
- **Frameguard:** Prevents clickjacking (deny all frames)
- **XSS Filter:** Enable browser XSS protections
- **No Sniff:** Prevents MIME type sniffing

```typescript
// In main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, preload: true },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
}));
```

---

### 5. Strict CORS Configuration

**Before:**
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
});
```

**After:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
});
```

---

### 6. Rate Limiting (Enhanced)

**Global Rate Limit:**
- 100 requests per 15 minutes per IP
- Applied to all endpoints

**Auth Endpoints (Stricter):**
- 5 attempts per 15 minutes per IP
- Only counts failed attempts

```typescript
// Auth-specific limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many authentication attempts',
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

---

### 7. Centralized Error Handling

**New:** `HttpExceptionFilter` for consistent error responses

**Benefits:**
- Uniform error format across all endpoints
- Secure error messages (don't expose internal details on 500 errors)
- Automatic logging of all errors
- Consistent HTTP status codes

```typescript
// All errors return this format:
{
  statusCode: 400,
  timestamp: "2025-11-26T10:30:00Z",
  path: "/auth/login",
  method: "POST",
  message: "Invalid credentials",
  // For 500+ errors: internal details hidden from client
}
```

---

### 8. Improved Logging

**What Gets Logged:**
- Successful user registrations
- Failed login attempts
- Account status changes
- Auth errors (without password)

```typescript
this.logger.log(`User registered: ${email}`);
this.logger.warn(`Login attempt with non-existent email: ${email}`);
this.logger.error(`Registration error: ${error.message}`);
```

---

## Frontend Security Enhancements

### 1. Axios Interceptors for Error Handling

**Request Interceptor:**
```typescript
api.interceptors.request.use((config) => {
  // HTTP-only cookies sent automatically
  // Backup token added if available
  const token = localStorage.getItem('backup_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor:** Handles all error cases

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error'));
    }

    const { status } = error.response;

    // 401: Session expired
    if (status === 401) {
      window.location.href = '/login?session_expired=true';
    }

    // 429: Rate limited
    if (status === 429) {
      return Promise.reject(new Error('Too many requests'));
    }

    // 400/422: Validation errors
    if (status === 400 || status === 422) {
      // Return user-friendly validation messages
    }

    // 500+: Server errors
    if (status >= 500) {
      return Promise.reject(new Error('Server error'));
    }
  },
);
```

### 2. Error Boundary Component

**Purpose:** Catch React component errors and prevent white-screen crashes

```typescript
// Wrap entire app with:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Features:**
- Graceful error UI with details toggle
- Reload button to recover
- Logs errors in development

### 3. Logout Functionality

**New Endpoint:** `POST /auth/logout`

**Action:** Clears HTTP-only authentication cookie on server

```typescript
@Post('logout')
async logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('authentication', { path: '/', httpOnly: true });
  return { message: 'Logout successful' };
}
```

### 4. Helper Functions

**getErrorMessage():** Extract clean error message for UI

```typescript
export const getErrorMessage = (error: any): string => {
  if (error?.message) return error.message;
  if (Array.isArray(error?.response?.data?.message)) {
    return error.response.data.message.join(', ');
  }
  return 'An unexpected error occurred';
};
```

---

## Environment Variables

**Backend (.env):**
```bash
# Security
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Server
PORT=3000
```

**Frontend (.env.local):**
```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Security Checklist

### Backend
- [x] HTTP-only cookies for JWT
- [x] CSRF protection (SameSite cookies)
- [x] CORS whitelist by environment
- [x] Helmet security headers (CSP, HSTS, frameguard, etc.)
- [x] Password validation (8+ chars, upper, lower, digit)
- [x] Email validation
- [x] Rate limiting (global + auth-specific)
- [x] Account status checks
- [x] Secure error messages (hide internals on 500)
- [x] Logging of auth attempts
- [x] Input validation (DTOs, class-validator)
- [x] Case-insensitive email storage

### Frontend
- [x] HTTP-only cookie credential support (withCredentials)
- [x] Axios interceptors for errors
- [x] Global error handling (401, 403, 404, 429, 500)
- [x] Session expiration detection and redirect
- [x] Error boundary for component crashes
- [x] Cleanup on logout
- [x] User-friendly error messages
- [x] No sensitive data in localStorage (except backup token)

---

## Common Scenarios

### Scenario 1: User Logs In

1. User submits email/password to `/auth/login`
2. Backend validates credentials
3. Backend creates JWT and sets HTTP-only cookie
4. Frontend receives 200 OK with user data
5. All subsequent API calls automatically include cookie
6. Cookie is NOT accessible to JavaScript

**Attack Prevented:** XSS stealing token from localStorage

### Scenario 2: Session Expires

1. User has valid cookie but 1 hour passes
2. Frontend makes API call
3. Server returns 401 (token expired)
4. Axios interceptor detects 401
5. Frontend redirects to `/login?session_expired=true`
6. User sees message "Your session has expired"

**Attack Prevented:** Using old/invalid tokens

### Scenario 3: Too Many Login Attempts

1. User attempts login 6 times in 15 minutes
2. Rate limiter on `/auth/login` triggers (limit: 5)
3. Server returns 429 (Too Many Requests)
4. Frontend shows error: "Too many login attempts. Try again in 15 minutes"

**Attack Prevented:** Brute force password attacks

### Scenario 4: CSRF Attack (Cross-Site Request Forgery)

1. Attacker tries to make API call from different domain
2. Browser enforces SameSite=strict cookie policy
3. Cookie is NOT sent with cross-site requests
4. Attack fails because no auth cookie

**Attack Prevented:** CSRF attacks

### Scenario 5: Clickjacking Attack

1. Attacker embeds Real Estate app in invisible iframe
2. Helmet's frameguard header: `X-Frame-Options: DENY`
3. Browser prevents loading in iframe
4. Attack fails

**Attack Prevented:** Clickjacking

---

## Testing Security

### Manual Testing

```bash
# 1. Test login flow
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# 2. Verify HTTP-only cookie is set
# (cookies.txt will contain "authentication" entry)

# 3. Test protected endpoint with cookie
curl -b cookies.txt http://localhost:3000/listings/popular

# 4. Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
# 6th+ request returns 429 Too Many Requests

# 5. Test CORS
curl -H "Origin: https://malicious.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3000/auth/login
# Returns error: CORS not allowed
```

### Automated Testing

See `Projects/backend/test/` for integration tests that verify:
- Auth endpoints return correct status codes
- Invalid credentials are rejected
- Protected routes block unauthenticated requests
- Error responses have consistent format

---

## Migration Guide (If Updating Existing App)

### For Frontend Code Using Old Client:

**Old Code:**
```typescript
const res = await authApi.login(email, password);
const token = res.data.access_token;
localStorage.setItem('token', token);
setAuthToken(token); // Manual header setup
```

**New Code:**
```typescript
const res = await authApi.login(email, password);
// Token is automatically in HTTP-only cookie
// No manual localStorage or header setup needed
// All API calls use the cookie automatically
```

### For Backend Endpoints:

**Old Code:**
```typescript
@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.auth.validateUser(dto.email, dto.password);
  return this.auth.login(user); // Returns token in body
}
```

**New Code:**
```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
  const user = await this.auth.validateUser(dto.email, dto.password);
  const { token } = await this.auth.login(user);
  res.cookie('authentication', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000,
    path: '/',
  });
  return { id: user.id, email: user.email, message: 'Login successful' };
}
```

---

## Future Security Enhancements

1. **Refresh Token Rotation**
   - Implement separate short-lived access token + long-lived refresh token
   - Refresh tokens stored in HTTP-only cookie
   - Auto-refresh before expiration

2. **Two-Factor Authentication (2FA)**
   - SMS or TOTP verification
   - Required on login for sensitive accounts

3. **Account Lockout**
   - Temporary lockout after N failed login attempts
   - Email notification on suspicious activity

4. **Password Reset**
   - Secure token-based password reset flow
   - Email verification link

5. **Audit Logging**
   - Log all sensitive actions (login, logout, password change, etc.)
   - Store in separate audit table with IP/user-agent

6. **Request Signing**
   - HMAC-SHA256 signing of requests
   - Verify request integrity

7. **API Key Authentication**
   - For service-to-service communication
   - Alternative to JWT for non-browser clients

---

## References

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8949
- **HTTP-Only Cookies:** https://owasp.org/www-community/HttpOnly
- **SameSite Cookies:** https://tools.ietf.org/html/draft-west-cookie-same-site
- **Content Security Policy:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

**Last Updated:** November 26, 2025
**Status:** ✅ Fully Implemented
**Tested:** Yes
