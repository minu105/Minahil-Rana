import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService, private mail: MailService) {}

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new UnauthorizedException('Email already in use');
    const user = await this.usersService.create(dto);
    // Generate OTP and email
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.usersService.setOtp(user.id, { otpHash, otpExpiresAt: expiresAt, otpLastSentAt: new Date() });
    await this.mail.sendOtp(user.email, otp);
    return { message: 'Registration successful. Please verify OTP sent to your email.' };
  }

  private async sign(userId: string, role: string) {
    return this.jwt.signAsync({ sub: userId, role });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    const token = await this.sign(user.id, user.role);
    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        firstPurchaseEligible: user.firstPurchaseEligible,
      },
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) return { message: 'Already verified' };
    if (!user.otpHash || !user.otpExpiresAt) throw new BadRequestException('No OTP requested');
    if (user.otpExpiresAt.getTime() < Date.now()) throw new BadRequestException('OTP expired');
    const ok = await bcrypt.compare(dto.otp, user.otpHash);
    if (!ok) throw new BadRequestException('Invalid OTP');
    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email verified successfully' };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) return { message: 'Already verified' };
    // basic throttling: 1 request per 60 seconds
    if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 60 * 1000) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.usersService.setOtp(user.id, { otpHash, otpExpiresAt: expiresAt, otpLastSentAt: new Date() });
    await this.mail.sendOtp(user.email, otp);
    return { message: 'OTP resent successfully' };
  }

  private generateOtp() {
    // 6-digit numeric OTP, no leading zeros trimmed
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
