import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @MinLength(1, { message: 'La contraseña no puede estar vacía' })
  password: string;
}

