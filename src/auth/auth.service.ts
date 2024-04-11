import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.model';
import * as bcrypt from 'bcrypt';
import { UserDetails } from 'src/utils/types';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { LoginCodeDto } from './dto/loginCode.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, phone, password } = registerDto;

    if ((!email && !phone) || (email && phone)) {
      throw new BadRequestException('Provide either email or phone');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = this.generateVerificationCode().code;
    const codeExpires = this.generateVerificationCode().expiresAt;

    try {
      const newUser = new this.userModel({
        ...registerDto,
        password: hashedPassword,
        code,
        codeExpires,
      });
      const savedUser = await newUser.save();

      //TODO EL CODIGO POR DEFAULT AL MOMENTO DE REGISTRARSE ES 123456

      if (email) {
        this.mailService.sendWelcomeEmail(email, code);
      } else if (phone) {
        //TODO: PENDIENTE ENVIAR SMS
      }

      const userObject = savedUser.toObject();
      delete userObject.password;
      delete userObject.code;
      delete userObject.codeExpires;
      return userObject;
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue)[0];
        throw new BadRequestException(
          `User with ${duplicateField} '${error.keyValue[duplicateField]}' already exists`,
        );
      } else {
        throw error;
      }
    }
  }

  async loginCode(loginCodeDto: LoginCodeDto) {
    const { email, phone, password } = loginCodeDto;

    let user;
    if (email) {
      user = await this.userModel.findOne({ email: loginCodeDto.email });
    } else if (phone) {
      user = await this.userModel.findOne({ phone: loginCodeDto.phone });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verified) {
      throw new BadRequestException('User not verified');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Password Incorrect');
    }

    let code = this.generateVerificationCode().code;
    let codeExpires = this.generateVerificationCode().expiresAt;

    // Enviar código al usuario
    if (email) {
      this.mailService.sendLoginCodeEmail(email, code);
    } else if (phone) {
      //TODO - PENDIENTE ENVIAR SMS
      code = '123456';
    }

    user.code = code;
    user.codeExpires = codeExpires;

    await user.save();

    return { message: 'Code sent for login' };
  }

  async loginByEmail(email: string, password: string, code: string) {
    return this.login('email', email, password, code);
  }

  async loginByPhone(phone: string, password: string, code: string) {
    return this.login('phone', phone, password, code);
  }

  private async login(
    field: string,
    value: string,
    password: string,
    code: string,
  ) {
    const user = await this.userModel
      .findOne({ [field]: value })
      .select('+password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    if (!user.verified) throw new BadRequestException('User not verified');

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new BadRequestException('Password Incorrect');
    if (!user.code) {
      throw new BadRequestException('Code not found');
    }
    if (user.code !== code) {
      throw new BadRequestException('Invalid code');
    }
    if (user.codeExpires < new Date()) {
      throw new BadRequestException('Code expired, resend code');
    }
    user.code = null;
    user.codeExpires = null;
    await user.save();
    return this.filterUserFields(user);
  }

  async validateUser(details: UserDetails) {
    const user = await this.userModel.findOne({ email: details.email });
    if (user) return user;
    const randomPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const newUser = new this.userModel({
      ...details,
      password: hashedPassword,
      verified: true,
    });
    return await newUser.save();
  }

  async generateToken(user: any) {
    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async verifyAccount(term: string, code: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: term }, { phone: term }],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.verified) {
      throw new BadRequestException('User is already verified');
    }
    if (user.code !== code) {
      throw new BadRequestException('Invalid code');
    }
    if (user.codeExpires < new Date()) {
      throw new BadRequestException('Code expired');
    }

    user.verified = true;
    user.code = null;
    user.codeExpires = null;

    await user.save();
    return this.filterUserFields(user);
  }

  async resendCodeRegister(term: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: term }, { phone: term }],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.verified) {
      throw new BadRequestException('User is already verified');
    }

    const code = this.generateVerificationCode().code;
    const codeExpires = this.generateVerificationCode().expiresAt;

    user.code = code;
    user.codeExpires = codeExpires;

    if (user.email) {
      this.mailService.resendCodeRegisterEmail(user.email, code);
    } else if (user.phone) {
      //TODO - PENDIENTE ENVIAR SMS
    }

    await user.save();
    return { message: 'Code resend for register' };
  }

  async resendCodeLogin(term: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: term }, { phone: term }],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.verified) {
      throw new BadRequestException('User not verified');
    }

    const code = this.generateVerificationCode().code;
    const codeExpires = this.generateVerificationCode().expiresAt;

    user.code = code;
    user.codeExpires = codeExpires;

    if (user.email) {
      this.mailService.resendCodeLoginEmail(user.email, code);
    } else if (user.phone) {
      //TODO - PENDIENTE ENVIAR SMS
    }

    await user.save();
    return { message: 'Code resend for login' };
  }
  private generateVerificationCode() {
    const min = 100000;
    const max = 999999;
    const code = String(Math.floor(Math.random() * (max - min + 1)) + min);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    return { code, expiresAt };
  }

  private filterUserFields(user: User) {
    const { _id, email, name, lastname, verified, createdAt, updatedAt } = user;
    return { _id, email, name, lastname, verified, createdAt, updatedAt };
  }

  private generateRandomPassword() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return password;
  }
}
