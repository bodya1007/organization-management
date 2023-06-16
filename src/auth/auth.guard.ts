import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization;

    if (!authToken) {
      return false;
    }

    try {
      const secretKey = process.env.JWT_SECRET;
      const verifyOptions: JwtVerifyOptions = {
        secret: secretKey,
      };
      const decodedToken = this.jwtService.decode(
        authToken.replace(/^Bearer\s|"|"/g, ''),
        verifyOptions,
      );

      request.user = decodedToken;

      return true;
    } catch (error) {
      return false;
    }
  }
}
