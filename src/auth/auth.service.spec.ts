import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PasswordVerifierService } from './password-verifier.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: PasswordVerifierService,
          useValue: {
            verifyPassword: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('test-token'),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            getPool: jest.fn().mockReturnValue({
              request: jest.fn().mockReturnValue({
                input: jest.fn().mockReturnThis(),
                query: jest.fn(),
              }),
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
