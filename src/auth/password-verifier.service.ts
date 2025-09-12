import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordVerifierService {
  
  /**
   * Проверяет пароль используя HASHBYTES SHA2_256
   */
  verifyPasswordWithHashbytes(password: string, storedHash: string): boolean {
    try {
      // console.log('🔍 Проверка пароля через HASHBYTES SHA2_256...');
      // console.log(`  Пароль: ${password}`);
      // console.log(`  Хранимый хэш: ${storedHash}`);
      
      // Генерируем SHA2_256 хэш для введенного пароля
      const generatedHash = crypto.createHash('sha256').update(password).digest('base64');
      // console.log(`  Сгенерированный хэш: ${generatedHash}`);
      
      // Сравниваем хэши
      const isValid = generatedHash === storedHash;
      
      if (isValid) {
        console.log('  ✅ СОВПАДЕНИЕ! Пароль верный');
      } else {
        console.log('  ❌ НЕ СОВПАДАЕТ! Пароль неверный');
      }
      
      return isValid;
      
    } catch (error) {
      console.error('❌ Ошибка проверки HASHBYTES:', error.message);
      return false;
    }
  }
  
  /**
   * Проверяет пароль используя ASP.NET Core Identity PBKDF2
   */
  verifyPasswordWithAspNetIdentity(password: string, storedHash: string): boolean {
    try {
      // console.log('🔍 Проверка пароля через ASP.NET Core Identity...');
      // console.log(`  Пароль: ${password}`);
      // console.log(`  Хранимый хэш: ${storedHash}`);
      
      // Декодируем base64 хэш
      const hashBytes = Buffer.from(storedHash, 'base64');
      
      if (hashBytes.length < 13) {
        console.log('❌ Хэш слишком короткий');
        return false;
      }
      
      // Парсим параметры ASP.NET Core Identity хэша
      const version = hashBytes[0];
      const prf = hashBytes.readUInt32BE(1);
      const iterations = hashBytes.readUInt32BE(5);
      const saltLength = hashBytes.readUInt32BE(9);
      
      // console.log('🔍 Параметры хэша:');
      // console.log(`  Version: ${version}`);
      // console.log(`  PRF: ${prf} (${prf === 2 ? 'HMACSHA256' : prf === 1 ? 'HMACSHA1' : 'Unknown'})`);
      // console.log(`  Iterations: ${iterations}`);
      // console.log(`  Salt length: ${saltLength} байт`);
      
      if (saltLength > 100 || saltLength < 0) {
        console.log('❌ Некорректная длина соли');
        return false;
      }
      
      // Извлекаем соль и подхэш
      const salt = hashBytes.slice(13, 13 + saltLength);
      const subkey = hashBytes.slice(13 + saltLength);
      
      // console.log(`  Salt (hex): ${salt.toString('hex')}`);
      // console.log(`  Subkey length: ${subkey.length} байт`);
      
      // Определяем алгоритм хэширования
      let algorithm: string;
      if (prf === 2) {
        // PRF=2 означает SHA512 (несмотря на название HMACSHA256)
        algorithm = 'sha512';
      } else if (prf === 1) {
        algorithm = 'sha1';
      } else {
        console.log(`❌ Неподдерживаемый PRF: ${prf}`);
        return false;
      }
      
      // console.log(`🔑 Используем алгоритм: ${algorithm.toUpperCase()}`);
      
      // Генерируем хэш для введенного пароля используя PBKDF2
      const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, subkey.length, algorithm);
      
      // console.log(`  Сгенерированный хэш (hex): ${derivedKey.toString('hex')}`);
      // console.log(`  Ожидаемый хэш (hex): ${subkey.toString('hex')}`);
      
      // Сравниваем хэши
      const isValid = crypto.timingSafeEqual(derivedKey, subkey);
      
      if (isValid) {
        console.log('  ✅ СОВПАДЕНИЕ! Пароль верный');
      } else {
        console.log('  ❌ НЕ СОВПАДАЕТ! Пароль неверный');
      }
      
      return isValid;
      
    } catch (error) {
      console.error('❌ Ошибка проверки ASP.NET Core Identity:', error.message);
      return false;
    }
  }
  
  /**
   * Универсальная функция проверки пароля
   * Автоматически определяет тип хэша и использует соответствующий метод
   */
  verifyPassword(password: string, storedHash: string): boolean {
    try {
      // console.log('🔍 Универсальная проверка пароля...');
      // console.log(`  Пароль: ${password}`);
      // console.log(`  Хранимый хэш: ${storedHash}`);
      
      // Определяем тип хэша по длине и формату
      const hashBytes = Buffer.from(storedHash, 'base64');
      
      if (hashBytes.length === 32) {
        // Простой SHA2_256 хэш (HASHBYTES)
        console.log('🔍 Обнаружен простой SHA2_256 хэш (HASHBYTES)');
        return this.verifyPasswordWithHashbytes(password, storedHash);
      } else if (hashBytes.length >= 13 && hashBytes[0] === 1) {
        // ASP.NET Core Identity хэш
        console.log('🔍 Обнаружен ASP.NET Core Identity хэш');
        return this.verifyPasswordWithAspNetIdentity(password, storedHash);
      } else {
        // Попробуем оба метода для неизвестного формата
        console.log('🔍 Тип хэша не определен, пробуем оба метода...');
        
        if (this.verifyPasswordWithHashbytes(password, storedHash)) {
          return true;
        }
        
        if (this.verifyPasswordWithAspNetIdentity(password, storedHash)) {
          return true;
        }
        
        console.log('❌ Ни один метод не дал совпадения');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Ошибка универсальной проверки:', error.message);
      return false;
    }
  }
}
