import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  private toSafe(u: User) {
    return {   id: (u._id as any).toString(), name: u.name, email: u.email, bio: u.bio, avatarUrl: u.avatarUrl,
      followersCount: u.followersCount, followingCount: u.followingCount };
  }

  private sign(u: User) {
    const payload = {   sub: (u._id as any).toString(), email: u.email, name: u.name };
    return this.jwt.sign(payload, {
      secret: this.cfg.get<string>('JWT_SECRET'),
      expiresIn: this.cfg.get<string>('JWT_EXPIRES_IN') || '7d',
    });
  }

  async signup(dto: SignupDto) {
    const exists = await this.users.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('Email already registered');
    const hash = await bcrypt.hash(dto.password, 10);
    const u = await this.users.create({ name: dto.name, email: dto.email, password: hash });
    const token = this.sign(u);
    return { user: this.toSafe(u), token };
  }

  async login(dto: LoginDto) {
    const u = await this.users.findOne({ email: dto.email }).select('+password');
    if (!u) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, u.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.sign(u);
    return { user: this.toSafe(u), token };
  }
}
