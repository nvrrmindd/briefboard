import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

/** What we put inside the JWT. Kept small: id + role is enough for guards. */
export interface JwtPayload {
  sub: string;
  role: User['role'];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.existsBy({ email })) {
      throw new ConflictException('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(this.users.create({ email, name: dto.name, passwordHash }));
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    // passwordHash has select:false on the entity, so ask for it explicitly here.
    const user = await this.users.findOne({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true, passwordHash: true },
    });
    // Same error for "no such user" and "wrong password" so attackers can't probe emails.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  me(userId: string) {
    return this.users.findOneByOrFail({ id: userId });
  }

  private async issueToken(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
