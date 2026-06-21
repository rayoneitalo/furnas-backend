import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)
    if (!token) throw new UnauthorizedException('Token não fornecido')
    try {
      this.jwtService.verify(token)
      return true
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado')
    }
  }

  private extractToken(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
