import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (!dto.termsAccepted) throw new BadRequestException('You must accept the terms');
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('Passwords do not match');

    const existingEmail = await this.users.findByEmail(dto.email);
    if (existingEmail) throw new UnauthorizedException('Email already in use');
    const existingUsername = await this.users.findByUsername(dto.username);
    if (existingUsername) throw new UnauthorizedException('Username already in use');

    // Optional: verify captcha token (placeholder)
    // if (process.env.RECAPTCHA_SECRET && dto.captchaToken) { /* verify with Google */ }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      acceptedTermsAt: new Date()
    });
    const tokens = await this.sign(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.sign(user);
    return { user, ...tokens };
  }

  private async sign(user: any) {
    const payload = { email: user.email, sub: user._id };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }
}
