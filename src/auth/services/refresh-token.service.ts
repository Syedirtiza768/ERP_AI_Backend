// src/auth/services/refresh-token.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    @Inject('JWT_REFRESH_TOKEN_CONFIG')
    private readonly refreshTokenConfig: { secret: string; expiresIn: string },
  ) {}

  async createRefreshToken(userId: string): Promise<string> {
    // Generate a random token string
    const tokenString = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiry date
    const expiresIn = this.refreshTokenConfig.expiresIn;
    const expiresInMs = parseInt(expiresIn.replace(/\D/g, '')) * 
      (expiresIn.includes('d') ? 86400000 : // days to ms
      expiresIn.includes('h') ? 3600000 : // hours to ms
      expiresIn.includes('m') ? 60000 : // minutes to ms
      1000); // seconds to ms
    
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);
    
    // Create and save the refresh token
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: tokenString,
      expiresAt,
      revoked: false,
    });
    
    await this.refreshTokenRepository.save(refreshToken);
    
    return tokenString;
  }

  async validateRefreshToken(token: string, userId: string): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        token,
        userId,
        revoked: false,
      },
    });
    
    if (!refreshToken) {
      return false;
    }
    
    // Check if token has expired
    if (new Date() > refreshToken.expiresAt) {
      await this.revokeRefreshToken(refreshToken.id);
      return false;
    }
    
    return true;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.refreshTokenRepository.update(id, { revoked: true });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true },
    );
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload);
  }
}