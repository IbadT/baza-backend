import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppLogger } from 'src/logger/logger.service';

@Injectable()
export class PasswordVerifierService {
  constructor(private readonly logger: AppLogger) {}

  /**
   * Проверяет пароль используя HASHBYTES SHA2_256
   */
  verifyPasswordWithHashbytes(password: string, storedHash: string): boolean {
    try {
      const generatedHash = crypto
        .createHash('sha256')
        .update(password)
        .digest('base64');
      const isValid = generatedHash === storedHash;

      this.logger.log(
        isValid ? 'HASHBYTES: пароль верный' : 'HASHBYTES: пароль неверный',
        'PasswordVerifierService',
      );

      return isValid;
    } catch (error) {
      this.logger.error(
        'Ошибка проверки HASHBYTES',
        error instanceof Error ? error.stack : String(error),
        'PasswordVerifierService',
      );
      return false;
    }
  }

  /**
   * Проверяет пароль используя ASP.NET Core Identity PBKDF2
   */
  verifyPasswordWithAspNetIdentity(
    password: string,
    storedHash: string,
  ): boolean {
    try {
      const hashBytes = Buffer.from(storedHash, 'base64');

      if (hashBytes.length < 13) {
        this.logger.warn('Хэш слишком короткий', 'PasswordVerifierService');
        return false;
      }

      const prf = hashBytes.readUInt32BE(1);
      const iterations = hashBytes.readUInt32BE(5);
      const saltLength = hashBytes.readUInt32BE(9);

      if (saltLength > 100 || saltLength < 0) {
        this.logger.warn('Некорректная длина соли', 'PasswordVerifierService');
        return false;
      }

      const salt = hashBytes.slice(13, 13 + saltLength);
      const subkey = hashBytes.slice(13 + saltLength);

      let algorithm: string;
      if (prf === 2) {
        algorithm = 'sha512';
      } else if (prf === 1) {
        algorithm = 'sha1';
      } else {
        this.logger.warn(
          `Неподдерживаемый PRF: ${prf}`,
          'PasswordVerifierService',
        );
        return false;
      }

      const derivedKey = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        subkey.length,
        algorithm,
      );
      const isValid = crypto.timingSafeEqual(derivedKey, subkey);

      this.logger.log(
        isValid
          ? 'ASP.NET Identity: пароль верный'
          : 'ASP.NET Identity: пароль неверный',
        'PasswordVerifierService',
      );

      return isValid;
    } catch (error) {
      this.logger.error(
        'Ошибка проверки ASP.NET Core Identity',
        error instanceof Error ? error.stack : String(error),
        'PasswordVerifierService',
      );
      return false;
    }
  }

  /**
   * Универсальная функция проверки пароля
   * Автоматически определяет тип хэша и использует соответствующий метод
   */
  verifyPassword(password: string, storedHash: string): boolean {
    try {
      const hashBytes = Buffer.from(storedHash, 'base64');

      if (hashBytes.length === 32) {
        this.logger.log('Обнаружен SHA2_256 хэш', 'PasswordVerifierService');
        return this.verifyPasswordWithHashbytes(password, storedHash);
      } else if (hashBytes.length >= 13 && hashBytes[0] === 1) {
        this.logger.log(
          'Обнаружен ASP.NET Core Identity хэш',
          'PasswordVerifierService',
        );
        return this.verifyPasswordWithAspNetIdentity(password, storedHash);
      } else {
        this.logger.warn(
          'Тип хэша не определен, пробуем оба метода...',
          'PasswordVerifierService',
        );

        if (this.verifyPasswordWithHashbytes(password, storedHash)) {
          return true;
        }

        if (this.verifyPasswordWithAspNetIdentity(password, storedHash)) {
          return true;
        }

        this.logger.warn(
          'Ни один метод не дал совпадения',
          'PasswordVerifierService',
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        'Ошибка универсальной проверки пароля',
        error instanceof Error ? error.stack : String(error),
        'PasswordVerifierService',
      );
      return false;
    }
  }
}
