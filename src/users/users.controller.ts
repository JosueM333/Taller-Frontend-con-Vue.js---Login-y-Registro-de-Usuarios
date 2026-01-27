import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // (Opcional) endpoint para ver usuarios sin password
  // Útil para comprobar que se están guardando
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
