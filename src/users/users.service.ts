import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: this.idCounter++,
      ...userData,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...rest }) => rest);
  }

  savePaymentInfo(userId: number, paymentInfo: { cardNumber: string; cardName: string; expirationDate: string; cvv: string }): User | undefined {
    const user = this.findById(userId);
    if (user) {
      user.paymentInfo = paymentInfo;
      return user;
    }
    return undefined;
  }

  getPaymentInfo(userId: number): any {
    const user = this.findById(userId);
    if (user && user.paymentInfo) {
      return user.paymentInfo;
    }
    return null;
  }
}
