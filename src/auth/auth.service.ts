import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private blacklist: Set<string> = new Set();
  private refreshTokens: Map<number, string> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  isBlacklisted(jti: string): boolean {
    return this.blacklist.has(jti);
  }

  getUserById(userId: number) {
    return this.usersService.findById(userId);
  }

  logout(jti: string) {
    if (jti) {
      this.blacklist.add(jti);
    }
  }

  async register(registerDto: RegisterDto) {
    const { nombre, email, password } = registerDto;

    const existing = this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersService.create({
      nombre,
      email,
      password: hashedPassword,
    });

    const { password: _pw, ...safeUser } = user;

    return {
      message: 'Usuario registrado exitosamente',
      user: safeUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const sessionId = uuidv4();
    user.sessionId = sessionId;

    const jti = uuidv4();
    const payload = { sub: user.id, email: user.email, nombre: user.nombre, sessionId, jti };
    
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = uuidv4(); // Rotación de refresh token

    this.refreshTokens.set(user.id, refresh_token);

    return {
      message: 'Login exitoso',
      access_token,
      refresh_token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    };
  }

  async refreshToken(userId: number, providedRefreshToken: string) {
    const user = this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no válido');

    const expectedRefreshToken = this.refreshTokens.get(userId);
    if (!expectedRefreshToken || expectedRefreshToken !== providedRefreshToken) {
      // Invalida todo si detecta reúso o token inválido
      this.refreshTokens.delete(userId);
      throw new UnauthorizedException('Refresh token revocado o incorrecto');
    }

    // Rotamos el refresh token
    const newRefreshToken = uuidv4();
    this.refreshTokens.set(userId, newRefreshToken);

    const jti = uuidv4();
    const payload = { sub: user.id, email: user.email, nombre: user.nombre, sessionId: user.sessionId, jti };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      refresh_token: newRefreshToken,
    };
  }

  getProfile(userId: number) {
    const user = this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { password: _pw, ...safeUser } = user;

    return {
      message: 'Perfil obtenido exitosamente',
      user: safeUser,
    };
  }
}
