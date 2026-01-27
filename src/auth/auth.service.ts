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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

    const payload = { sub: user.id, email: user.email, nombre: user.nombre };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login exitoso',
      access_token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
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
