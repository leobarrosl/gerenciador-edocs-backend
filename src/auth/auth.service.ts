import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) return null;

    const { passwordHash: _, ...result } = user;
    return result;
  }

  login(user: { id: string; email: string; name: string }) {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
