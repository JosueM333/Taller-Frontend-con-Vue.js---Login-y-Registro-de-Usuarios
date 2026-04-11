import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  Res,
  UnauthorizedException 
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registro de nuevo usuario
   * Ruta PÚBLICA
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Inicio de sesión
   * Ruta PÚBLICA
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    
    // Cookie parameters (HttpOnly para XSS mitigación)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false, // Set to true en producción HTTPS
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return {
      message: result.message,
      user: result.user,
      refresh_token: result.refresh_token // Enviamos refresh token en body para guardarlo en memoria o localStorage del Front
    };
  }

  /**
   * POST /auth/logout
   * Cierre de sesión (Falta de Revocación mitigada Test 1)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const jti = req.user.jti;
    this.authService.logout(jti);
    
    // Limpiamos la cookie
    res.clearCookie('access_token');
    
    return {
      message: 'Cierre de sesión exitoso y token revocado.',
    };
  }

  /**
   * POST /auth/refresh
   * Rotación de tokens (Mitigación persitencia e indifinición Test 4 & 6)
   */
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string, @Body('userId') userId: number, @Res({ passthrough: true }) res: Response) {
    if (!refreshToken || !userId) {
      throw new UnauthorizedException('Faltan parámetros de refresco');
    }
    
    const result = await this.authService.refreshToken(userId, refreshToken);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return {
      message: 'Token refrescado correctamente',
      refresh_token: result.refresh_token
    };
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   * Ruta PROTEGIDA - requiere token válido
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user viene del JwtStrategy.validate()
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user,
    };
  }

  /**
   * GET /auth/protected
   * Ejemplo de ruta protegida
   * Ruta PROTEGIDA - requiere token válido
   */
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  protectedRoute(@Request() req) {
    return {
      message: `¡Hola ${req.user.nombre}! Esta es una ruta protegida.`,
      timestamp: new Date().toISOString(),
      userId: req.user.userId,
    };
  }

  /**
   * POST /auth/payment-info
   * Guardar datos de tarjeta simulada
   */
  @UseGuards(JwtAuthGuard)
  @Post('payment-info')
  savePaymentInfo(@Request() req, @Body() paymentInfo: any) {
    this.authService.savePaymentInfo(req.user.userId, paymentInfo);
    return {
      message: 'Datos de pago guardados correctamente y protegidos.',
    };
  }

  /**
   * GET /auth/payment-info
   * Obtener datos de tarjeta simulada
   */
  @UseGuards(JwtAuthGuard)
  @Get('payment-info')
  getPaymentInfo(@Request() req) {
    const paymentInfo = this.authService.getPaymentInfo(req.user.userId);
    return {
      message: 'Datos de pago obtenidos',
      paymentInfo: paymentInfo || null,
    };
  }
}