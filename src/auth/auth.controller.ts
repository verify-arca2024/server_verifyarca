import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { LoginCodeDto } from './dto/loginCode.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const configService = new ConfigService();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login-code')
  async loginCode(@Body() loginCodeDto: LoginCodeDto) {
    const { email, phone } = loginCodeDto;
    if ((!email && !phone) || (email && phone)) {
      throw new BadRequestException('Provide either email or phone');
    }

    const response = await this.authService.loginCode(loginCodeDto);
    return response;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, phone } = loginDto;
    //TODO - REFACTORIZAR ESTE CÓDIGO
    if ((!email && !phone) || (email && phone)) {
      throw new BadRequestException('Provide either email or phone');
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

  @Post('verify/:term')
  async verifyAccount(
    @Param('term') term: string,
    @Body() verifyDto: VerifyDto,
  ) {
    const user = await this.authService.verifyAccount(term, verifyDto.code);
    const token = await this.authService.generateToken(user);

    return {
      token,
      user,
    };
  }

  @Post('resend-code/register/:term')
  async resendCodeRegister(@Param('term') term: string) {
    return this.authService.resendCodeRegister(term);
  }
  @Post('resend-code/login/:term')
  async resendCodeLogin(@Param('term') term: string) {
    return this.authService.resendCodeLogin(term);
  }

  @Post('forgot-password/:term')
  async forgotPassword(@Param('term') term: string) {
    return this.authService.forgotPassword(term);
  }

  @Post('verify-recovery-code/:term')
  async verifyRecoveryCode(
    @Param('term') term: string,
    @Body() verifyDto: VerifyDto,
  ) {
    const user = await this.authService.verifyRecoveryCode(
      term,
      verifyDto.code,
    );

    return {
      message: 'Recovery code verified',
    };
  }

  @Post('reset-password/:term')
  async resetPassword(
    @Param('term') term: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      term,
      resetPasswordDto.code,
      resetPasswordDto.password,
    );
  }
}
