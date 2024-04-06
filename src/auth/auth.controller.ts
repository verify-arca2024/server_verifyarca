import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { VerifyDto } from './dto/verify.dto';

const configService = new ConfigService();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    if ((!loginDto.email && !loginDto.phone) || !loginDto.password) {
      throw new BadRequestException('Email/phone and password are required');
    }
    let user;
    if (loginDto.email) {
      user = await this.authService.loginByEmail(
        loginDto.email,
        loginDto.password,
        loginDto.code,
      );
    } else if (loginDto.phone) {
      user = await this.authService.loginByPhone(
        loginDto.phone,
        loginDto.password,
        loginDto.code,
      );
    }

    const token = await this.authService.generateToken(user);
    return {
      token,
      user,
    };
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: any) {
    const { user } = <any>req;

    const token = await this.authService.generateToken(user);

    res.cookie('token', token, { httpOnly: true });
    res.cookie('user', user, { httpOnly: true });

    // Redirigir al frontend
    res.redirect(`${configService.get('FRONTEND_URL')}`);
  }

  @Post('verify/:userId')
  async verifyAccount(
    @Param('userId', ParseMongoIdPipe) userId: string,
    @Body() verifyDto: VerifyDto,
  ) {
    return this.authService.verifyAccount(userId, verifyDto.code);
  }

  @Post('resend-code/:userId')
  async resendCode(@Param('userId', ParseMongoIdPipe) userId: string) {
    return this.authService.resendCode(userId);
  }
}
