const crypto = require('crypto');

function debugPBKDF2() {
    console.log('=== Детальная отладка PBKDF2 ===\n');
    
    const password = "1234567";
    const storedHash = "AQAAAAIAAYagAAAAELfk9GjyqUvLrtcyae3bjhLQqlKHyhNZPUxfx0nzjFg3BaLqenTN7PJZ553RRzPIqg==";
    
    console.log(`🔑 Пароль: ${password}`);
    console.log(`📝 Хранимый хэш: ${storedHash}\n`);
    
    try {
        // 1. Декодируем base64
        const hashBytes = Buffer.from(storedHash, 'base64');
        console.log('1️⃣ Декодирование base64:');
        console.log(`   Размер: ${hashBytes.length} байт`);
        console.log(`   Hex: ${hashBytes.toString('hex')}\n`);
        
        // 2. Парсим заголовок
        const version = hashBytes[0];
        const prf = hashBytes.readUInt32BE(1);
        const iterations = hashBytes.readUInt32BE(5);
        const saltLength = hashBytes.readUInt32BE(9);
        
        console.log('2️⃣ Парсинг заголовка:');
        console.log(`   Version: ${version}`);
        console.log(`   PRF: ${prf} (${prf === 2 ? 'HMACSHA256' : prf === 1 ? 'HMACSHA1' : 'Unknown'})`);
        console.log(`   Iterations: ${iterations}`);
        console.log(`   Salt length: ${saltLength} байт\n`);
        
        // 3. Извлекаем соль и subkey
        const salt = hashBytes.slice(13, 13 + saltLength);
        const subkey = hashBytes.slice(13 + saltLength);
        
        console.log('3️⃣ Извлечение данных:');
        console.log(`   Salt (hex): ${salt.toString('hex')}`);
        console.log(`   Salt (base64): ${salt.toString('base64')}`);
        console.log(`   Subkey length: ${subkey.length} байт`);
        console.log(`   Subkey (hex): ${subkey.toString('hex')}\n`);
        
        // 4. Тестируем разные варианты PBKDF2
        console.log('4️⃣ Тестирование PBKDF2:');
        
        // Вариант 1: Стандартный PBKDF2
        console.log('   Вариант 1: Стандартный PBKDF2');
        const derivedKey1 = crypto.pbkdf2Sync(password, salt, iterations, subkey.length, 'sha256');
        console.log(`   Результат (hex): ${derivedKey1.toString('hex')}`);
        console.log(`   Совпадение: ${crypto.timingSafeEqual(derivedKey1, subkey) ? '✅ ДА' : '❌ НЕТ'}\n`);
        
        // Вариант 2: С разными итерациями
        console.log('   Вариант 2: Разные итерации');
        const iterationVariations = [1000, 10000, 50000, 75000, 125000, 150000, 200000];
        
        for (const iter of iterationVariations) {
            try {
                const derivedKey = crypto.pbkdf2Sync(password, salt, iter, subkey.length, 'sha256');
                const match = crypto.timingSafeEqual(derivedKey, subkey);
                console.log(`   ${iter} итераций: ${match ? '✅ СОВПАДЕНИЕ!' : '❌'}`);
                if (match) {
                    console.log(`   🎉 НАЙДЕНО! Правильное количество итераций: ${iter}`);
                    break;
                }
            } catch (e) {
                console.log(`   ${iter} итераций: ❌ Ошибка`);
            }
        }
        console.log('');
        
        // Вариант 3: С разными алгоритмами
        console.log('   Вариант 3: Разные алгоритмы');
        const algorithms = ['sha1', 'sha256', 'sha512'];
        
        for (const algo of algorithms) {
            try {
                const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, subkey.length, algo);
                const match = crypto.timingSafeEqual(derivedKey, subkey);
                console.log(`   ${algo.toUpperCase()}: ${match ? '✅ СОВПАДЕНИЕ!' : '❌'}`);
            } catch (e) {
                console.log(`   ${algo.toUpperCase()}: ❌ Ошибка`);
            }
        }
        console.log('');
        
        // Вариант 4: С модифицированным паролем
        console.log('   Вариант 4: Модифицированный пароль');
        const passwordVariations = [
            password,
            password + ' ',
            ' ' + password,
            password + '\n',
            password + '\r',
            password + '\t',
            password.toUpperCase(),
            password.toLowerCase()
        ];
        
        for (const pwd of passwordVariations) {
            try {
                const derivedKey = crypto.pbkdf2Sync(pwd, salt, iterations, subkey.length, 'sha256');
                const match = crypto.timingSafeEqual(derivedKey, subkey);
                console.log(`   "${pwd}": ${match ? '✅ СОВПАДЕНИЕ!' : '❌'}`);
                if (match) {
                    console.log(`   🎉 НАЙДЕНО! Правильный пароль: "${pwd}"`);
                    break;
                }
            } catch (e) {
                console.log(`   "${pwd}": ❌ Ошибка`);
            }
        }
        console.log('');
        
        // 5. Проверяем, может быть используется HMAC
        console.log('5️⃣ Тестирование HMAC:');
        const hmacVariations = ['sha1', 'sha256', 'sha512'];
        
        for (const algo of hmacVariations) {
            try {
                const hmac = crypto.createHmac(algo, salt);
                hmac.update(password);
                const hmacResult = hmac.digest();
                
                // Обрезаем до нужной длины
                const truncatedHmac = hmacResult.slice(0, subkey.length);
                const match = crypto.timingSafeEqual(truncatedHmac, subkey);
                console.log(`   HMAC-${algo.toUpperCase()}: ${match ? '✅ СОВПАДЕНИЕ!' : '❌'}`);
            } catch (e) {
                console.log(`   HMAC-${algo.toUpperCase()}: ❌ Ошибка`);
            }
        }
        
        // 6. ДЕТАЛЬНОЕ СРАВНЕНИЕ SHA256 vs SHA512
        console.log('\n6️⃣ ДЕТАЛЬНОЕ СРАВНЕНИЕ SHA256 vs SHA512:');
        console.log('   Ожидаемый subkey (hex):', subkey.toString('hex'));
        console.log('');
        
        // SHA256
        const sha256Result = crypto.pbkdf2Sync(password, salt, iterations, subkey.length, 'sha256');
        console.log('   SHA256 результат (hex):', sha256Result.toString('hex'));
        console.log('   SHA256 совпадение:', crypto.timingSafeEqual(sha256Result, subkey) ? '✅ ДА' : '❌ НЕТ');
        console.log('');
        
        // SHA512
        const sha512Result = crypto.pbkdf2Sync(password, salt, iterations, subkey.length, 'sha512');
        console.log('   SHA512 результат (hex):', sha512Result.toString('hex'));
        console.log('   SHA512 совпадение:', crypto.timingSafeEqual(sha512Result, subkey) ? '✅ ДА' : '❌ НЕТ');
        console.log('');
        
        // Показываем разницу
        console.log('7️⃣ АНАЛИЗ:');
        if (crypto.timingSafeEqual(sha512Result, subkey)) {
            console.log('   🎯 SHA512: РАБОТАЕТ!');
            console.log('   ❌ SHA256: НЕ РАБОТАЕТ!');
            console.log('   📝 ВЫВОД: В хэше указан PRF=2 (HMACSHA256), но фактически используется SHA512!');
            console.log('   🔧 Это ошибка в ASP.NET Core Identity или кастомная реализация!');
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запускаем отладку
debugPBKDF2();
