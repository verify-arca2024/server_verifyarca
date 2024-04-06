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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
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
        code: '123456',
        codeExpires,
      });
      const savedUser = await newUser.save();

      //TODO PENDIENTE ENVIAR CODIGO AL USUARIO (EVALUAR SI TIENE EMAIL / PHONE Y ENVIAR CODIGO A ESE MEDIO)

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

    if (user.code !== code) {
      throw new BadRequestException('Invalid code');
    }

    return this.filterUserFields(user);
  }

  private filterUserFields(user: User) {
    const { _id, email, name, lastname, verified, createdAt, updatedAt } = user;
    return { _id, email, name, lastname, verified, createdAt, updatedAt };
  }

  async validateUser(details: UserDetails) {
    const user = await this.userModel.findOne({ email: details.email });
    if (user) return user;

    const newUser = new this.userModel({
      ...details,
      password: '123456',
      verified: true,
    });
    return await newUser.save();
  }

  async generateToken(user: any) {
    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async verifyAccount(userId: string, code: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.code !== code) {
      throw new BadRequestException('Invalid code');
    }

    if (user.codeExpires < new Date()) {
      throw new BadRequestException('Code expired');
    }

    user.verified = true;
    user.code = null;

    await user.save();
    return this.filterUserFields(user);
  }

  async resendCode(userId: string) {
    const user = await this.userModel.findById(userId);
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

    //TODO: PENDIENTE ENVIAR CODIGO AL USUARIO (EVALUAR SI TIENE EMAIL / PHONE Y ENVIAR CODIGO A ESE MEDIO)

    await user.save();
    return { message: 'Code sent' };
  }

  private generateVerificationCode() {
    const min = 100000;
    const max = 999999;
    const code = String(Math.floor(Math.random() * (max - min + 1)) + min);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    return { code, expiresAt };
  }
}
