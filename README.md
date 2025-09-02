## Скопировать и заполнить данные из .env.example в .env
```bash
cp .env.example .env
```


## Запустить сервер
```bash
docker compose up --build -d
```




Задачи:
1. sql иньекции


2. whitelist для X-Domain ✅


3. filters(errors) ✅
4. interfaces ✅
5. swagger documentation ✅
6. bll ✅


7. Логирование: Фиксация подозрительных запросов


8. Валидация: HTTP 400 при неверных параметрах ✅(?)


9. написать тесты  ? ✅ ?


10. redis - запись по ключу + параметрам ✅
11. подключить sentry ✅
12. Создать Guard для xDomain ✅
13. Добавить whitelist для доменов ✅
14. Дублирование кода при получении X-Domain заголовка ✅
15. Создать Guard для xDomain ✅
16. Поднять из документации 401 400 ошибки исходя из x-domain, authorization, x-api-key
17. добавить вот такое отображение в документации везде 
        **Поддерживаемые категории:**
        - \`tires\` - шины
        - \`wheels\` - диски  
        - \`accessories\` - аксессуары
18. 




### Безопастность
1. sql иньекции
2. CORS настройки для продакшена
3. rate limiting
4. 






// Разбить на более мелкие сервисы:
- ProductRepository (для работы с БД)
- ProductQueryBuilder (для построения SQL)
- ProductCacheService (для кэширования)
- ProductValidationService (для валидации)


Улучшить тестирование

/ Создать config модуль:
@Module({
  imports: [ConfigModule.forRoot({
    validationSchema: Joi.object({
      DB_HOST: Joi.string().required(),
      // ...
    })
  })]
})

Логирование














## Основные таблицы приложения:
Products - товары
Categories - категории
Vendors - поставщики
Orders - заказы
OrderItems - элементы заказов
Customers - клиенты
Reservations - резервации
ReservationCarts - корзины резерваций
Автомобильные таблицы:
CarVendors - производители автомобилей
CarModels - модели автомобилей
CarModelsGenerations - поколения моделей
Models - модели (возможно шин/дисков)
ModelPhotos - фото моделей

Таблицы шин:
TireTypesizes - типоразмеры шин
TireTypesizesCube - куб типоразмеров шин
TireDiameters - диаметры шин
TireHeights - высоты шин
TireWidthes - ширины шин
Таблицы дисков:
WheelTypesizes - типоразмеры дисков
WheelTypesizesCube - куб типоразмеров дисков

Системные таблицы:
__EFMigrationsHistory - история миграций Entity Framework
AspNet* - таблицы ASP.NET Core Identity
django_* - таблицы Django
auth_* - таблицы аутентификации Django
silk_* - таблицы Silk (профилирование)
sysdiagrams - системные диаграммы
Дополнительные таблицы:
PriceActual - актуальные цены
PriceHistory - история цен
ProductsCaptionMappings - маппинги заголовков товаров
ProductsRelations - связи товаров
SameModels - одинаковые модели
ChatMessages, Chats, UserChats - чат система
CustomerPoints - баллы клиентов
UserCustomersGroups - группы клиентов пользователей
ExportPresets, ExportQueue - экспорт данных





















Connecting to database...

=== TABLES ===
Tables: [
  '__EFMigrationsHistory',
  'Administrators',
  'AspNetRoleClaims',
  'AspNetRoles',
  'AspNetUserClaims',
  'AspNetUserLogins',
  'AspNetUserRoles',
  'AspNetUsers',
  'AspNetUserTokens',
  'auth_group',
  'auth_group_permissions',
  'auth_permission',
  'auth_user',
  'auth_user_groups',
  'auth_user_user_permissions',
  'CarModels',
  'CarModelsGenerations',
  'CarVendors',
  'Categories',
  'ChatMessages',
  'Chats',
  'CustomerPoints',
  'Customers',
  'django_admin_log',
  'django_content_type',
  'django_migrations',
  'django_session',
  'ExportPresets',
  'ExportQueue',
  'ModelPhotos',
  'Models',
  'OrderItems',
  'Orders',
  'PriceActual',
  'PriceHistory',
  'Products',
  'ProductsCaptionMappings',
  'ProductsRelations',
  'ReservationCarts',
  'Reservations',
  'SameModels',
  'silk_profile',
  'silk_profile_queries',
  'silk_request',
  'silk_response',
  'silk_sqlquery',
  'sysdiagrams',
  'TempProductsRelations',
  'TireDiameters',
  'TireHeights',
  'TireTypesizes',
  'TireTypesizesCube',
  'TireWidthes',
  'UserChats',
  'UserCustomersGroupItems',
  'UserCustomersGroups',
  'UserToCustomerGroupPolicies',
  'Vendors',
  'WheelTypesizes',
  'WheelTypesizesCube'
]

=== PRODUCTS TABLE COLUMNS ===
Products columns: [
  { COLUMN_NAME: 'ID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' },
  { COLUMN_NAME: 'ModelID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' },
  {
    COLUMN_NAME: 'AdditionalSpecifications',
    DATA_TYPE: 'nvarchar',
    IS_NULLABLE: 'YES'
  },
  {
    COLUMN_NAME: 'Specifications',
    DATA_TYPE: 'nvarchar',
    IS_NULLABLE: 'YES'
  }
]

=== SAMPLE PRODUCTS DATA ===
Sample data: [
  {
    "ID": 1,
    "ModelID": 1,
    "AdditionalSpecifications": "чёрно-перлам",
    "Specifications": null
  },
  {
    "ID": 2,
    "ModelID": 2,
    "AdditionalSpecifications": "6.5",
    "Specifications": null
  },
  {
    "ID": 3,
    "ModelID": 3410,
    "AdditionalSpecifications": "чёрно-перлам",
    "Specifications": null
  }
]

=== MODELS TABLE COLUMNS ===
Models columns: [
  { COLUMN_NAME: 'ID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' },
  { COLUMN_NAME: 'Name', DATA_TYPE: 'nvarchar', IS_NULLABLE: 'NO' },
  { COLUMN_NAME: 'VendorID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' },
  {
    COLUMN_NAME: 'Classification',
    DATA_TYPE: 'smallint',
    IS_NULLABLE: 'YES'
  }
]

=== VENDORS TABLE COLUMNS ===
Vendors columns: [
  { COLUMN_NAME: 'ID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' },
  { COLUMN_NAME: 'Name', DATA_TYPE: 'nvarchar', IS_NULLABLE: 'NO' },
  {
    COLUMN_NAME: 'Transcript',
    DATA_TYPE: 'nvarchar',
    IS_NULLABLE: 'NO'
  },
  { COLUMN_NAME: 'CategoryID', DATA_TYPE: 'int', IS_NULLABLE: 'NO' }
]


















# Таблица Customers - Полные данные

## 📋 Структура таблицы

| № | Поле | Тип | Nullable | Длина | Описание |
|---|------|-----|----------|-------|----------|
| 1 | ID | int(10) | NO | 10 | Первичный ключ, уникальный идентификатор клиента |
| 2 | Name | nvarchar(50) | NO | 50 | Название клиента/компании |
| 3 | UserId | nvarchar(450) | YES | 450 | Ссылка на пользователя в системе аутентификации |

## 📊 Статистика

- **Всего записей:** 100
- **Уникальных названий:** 92
- **С привязкой к пользователю:** 22
- **Без привязки к пользователю:** 78

## 👥 Все клиенты

| ID | Название | UserId |
|----|----------|---------|
| 1 | MegaSklad24 | 404d61eb-a1f1-4fa2-9c45-7f022f92e6e8 |
| 2 | ЧЗС-Авто | NULL |
| 3 | Лоял | 548714b1-9e47-4d83-98cf-df6966fbab50 |
| 4 | Стиль Движения | 5d8626f4-9cef-4371-9ec0-4642afc5fbaa |
| 5 | T-Master | e82cb3f2-aec9-4ae4-9917-ef341c670220 |
| 6 | Л-Авто | NULL |
| 7 | Вакси-Трейд | c40a0698-0b86-488b-931a-59889c37d96d |
| 8 | Опшинторг | NULL |
| 9 | Шкода-Авто | NULL |
| 10 | КолесоПлюс | NULL |
| 11 | Лонакс Авто | NULL |
| 12 | ИП Рогач | NULL |
| 13 | Город Шин | NULL |
| 14 | Багория (диски) | NULL |
| 15 | Сток65 | 6ecceb39-62f1-4c54-a8e4-f77a58a43003 |
| 16 | ТШК | NULL |
| 17 | Армтэк | NULL |
| 18 | ИП Довнар | NULL |
| 19 | Коре-Ильбо | NULL |
| 20 | Технохимтрейд | NULL |
| 21 | Багория (шины) | NULL |
| 22 | AlVis [Лабазова] | 6debf202-5d98-4c77-bffc-74a18d40f00d |
| 23 | ГранатТорг | NULL |
| 24 | Промышленное оборудование | NULL |
| 25 | Нокиан тайрс | NULL |
| 26 | не помню | NULL |
| 27 | Римбат | NULL |
| 28 | СтартШина | NULL |
| 29 | Русские Шины | NULL |
| 30 | Энержи | NULL |
| 31 | 1T.BY | d1508aae-00a9-4b75-998b-45aca46edcb2 |
| 32 | не помню | NULL |
| 33 | не помню | NULL |
| 34 | не помню | NULL |
| 35 | Покрышкино | NULL |
| 36 | Моторлэнд | NULL |
| 37 | Шинтрэк, ООО | NULL |
| 39 | не помню | NULL |
| 40 | Мегавтотекс | NULL |
| 41 | ИП Сагидулин | NULL |
| 42 | Форто | NULL |
| 43 | Avtoshina [Карпукович] | NULL |
| 44 | Камтех | NULL |
| 45 | Balsana | NULL |
| 46 | Шате-М | NULL |
| 47 | 21vek | adca5f3b-8cce-4dff-8019-0d097e5e1c82 |
| 48 | не помню | NULL |
| 49 | не помню | NULL |
| 50 | Автосеть | NULL |
| 51 | Паречин, ИП | NULL |
| 52 | Kolobox | NULL |
| 53 | Cooper Spb | NULL |
| 55 | Дискавери | NULL |
| 56 | Линарис | NULL |
| 57 | КолесоОнлайн | NULL |
| 58 | Эсклюзив | NULL |
| 59 | Schale | NULL |
| 60 | Шининвест | NULL |
| 61 | ШинаСервис | 45f2f796-075b-44e7-b460-595cbf4171bf |
| 62 | Shinasu | NULL |
| 63 | TrekTyre | NULL |
| 64 | TrekTyre Spb | NULL |
| 65 | Сток79 | NULL |
| 66 | YarShinTorg | NULL |
| 67 | Антон МСК | NULL |
| 69 | ПКФ "ПИН" | NULL |
| 70 | Бринекс | NULL |
| 75 | KupiRezinu | NULL |
| 77 | Сводный | NULL |
| 78 | Олта | NULL |
| 80 | Восток-Авто | 4ceddb40-16e6-40bb-8b22-7392b5402634 |
| 81 | не помню | NULL |
| 82 | LigaTires | NULL |
| 83 | СеверАвто | NULL |
| 84 | Шинсервис СпБ | NULL |
| 85 | Шинсервис | NULL |
| 86 | Medved-66 | NULL |
| 87 | ShinaPiter | NULL |
| 88 | Витебская | NULL |
| 89 | TireShop Spb | NULL |
| 90 | Vels | NULL |
| 91 | AsiaШины | NULL |
| 93 | RO-SA | NULL |
| 95 | Райфен | NULL |
| 96 | Автобот | NULL |
| 129 | ProShina | 95f9e787-1f4e-41cf-a50a-53f574a17e57 |
| 130 | 0000.BY | NULL |
| 131 | TyreG.by | 61e0d707-b66e-4567-9f07-d10d6150f098 |
| 132 | N-Tyre.by | 08ffa0c3-d325-449d-aa1d-b388ac9bc564 |
| 134 | UNKN134 | NULL |
| 135 | UNKN135 | NULL |
| 136 | TD Shin | 6b90d877-8a67-4aca-b899-7eb2af856827 |
| 137 | Базис ВР | NULL |
| 138 | coleso.by | 4f250ec6-6221-4014-b384-3c91dd257fa1 |
| 139 | UNKN139 | 84330e70-dc6b-4c69-9d18-406475385bb2 |
| 140 | UNKN140 | 291d0a55-9c20-4216-a184-f5fe54d4498e |
| 155 | 0000.BY | d0266fb9-2753-4ee3-b095-9871fa8e0594 |
| 156 | BaseTest | 9783fc37-a15a-4d1d-ad3c-5839b838da16 |
| 157 | roma500@tut.by | 3f3577cc-67ad-463a-b4f3-a6bb9fd3ff1f |
| 159 | cityliner | 0d581ec8-c5a8-419b-8243-6b7487380fbb |

## 🔍 Анализ данных

### Поля с NULL значениями:
- **ID:** 100 уникальных значений, 0 NULL значений
- **Name:** 92 уникальных значений, 0 NULL значений
- **UserId:** 22 уникальных значений, 78 NULL значений

### Особенности:
- ID не последовательные (есть пропуски)
- Много клиентов с названиями "не помню" и "UNKN" (возможно тестовые)
- Поле UserId связывает клиентов с системой аутентификации

---
*Данные экспортированы: 02.09.2025, 08:56:49*


## 🌐 Найденные домены в базе данных

### 📊 Статистика по доменам верхнего уровня:
- **.by:** 96 упоминаний
- **.ru:** 68 упоминаний
- **.com:** 54 упоминаний
- **.jpg:** 13 упоминаний

### 📋 Детали по таблицам:

#### Таблица: **AspNetUsers** (поле: Email)
- 17zek91@mail.ru
- a@a.com
- alexfrunz@gmail.com
- auto@21vek.by
- baza@road.by
- director@proshina.by
- evstratov.wheels@yandex.ru
- extype@tut.by
- hrol.86@mail.ru
- info@n-tyre.by
- info@rezina1.ru
- minsk5770017@yandex.by
- motopark-minsk@yandex.by
- ob@aspirity.com
- ob1@aspirity.com
- roma500@tut.by
- roman0000by@yandex.by
- roman555@tut.by
- shina@vaksi.by
- shina-2005@mail.ru
- statkevich_s@bk.ru
- td-shin@yandex.ru
- test1@test.by
- test1235@mail.ru
- test123test@mail.ru
- tyregprice@gmail.com

#### Таблица: **AspNetUsers** (поле: NormalizedEmail)
- 17ZEK91@MAIL.RU
- A@A.COM
- ALEXFRUNZ@GMAIL.COM
- AUTO@21VEK.BY
- BAZA@ROAD.BY
- DIRECTOR@PROSHINA.BY
- EVSTRATOV.WHEELS@YANDEX.RU
- EXTYPE@TUT.BY
- HROL.86@MAIL.RU
- INFO@N-TYRE.BY
- INFO@REZINA1.RU
- MINSK5770017@YANDEX.BY
- MOTOPARK-MINSK@YANDEX.BY
- OB@ASPIRITY.COM
- OB1@ASPIRITY.COM
- ROMA500@TUT.BY
- ROMAN0000BY@YANDEX.BY
- ROMAN555@TUT.BY
- SHINA@VAKSI.BY
- SHINA-2005@MAIL.RU
- STATKEVICH_S@BK.RU
- TD-SHIN@YANDEX.RU
- TEST1@TEST.BY
- TEST1235@MAIL.RU
- TEST123TEST@MAIL.RU
- TYREGPRICE@GMAIL.COM

#### Таблица: **AspNetUsers** (поле: NormalizedUserName)
- 17ZEK91@MAIL.RU
- A@A.COM
- ALEXFRUNZ@GMAIL.COM
- AUTO@21VEK.BY
- BAZA@ROAD.BY
- DIRECTOR@PROSHINA.BY
- EVSTRATOV.WHEELS@YANDEX.RU
- EXTYPE@TUT.BY
- HROL.86@MAIL.RU
- INFO@N-TYRE.BY
- INFO@REZINA1.RU
- MINSK5770017@YANDEX.BY
- MOTOPARK-MINSK@YANDEX.BY
- OB@ASPIRITY.COM
- OB1@ASPIRITY.COM
- ROMA500@TUT.BY
- ROMAN0000BY@YANDEX.BY
- ROMAN555@TUT.BY
- SHINA@VAKSI.BY
- SHINA-2005@MAIL.RU
- STATKEVICH_S@BK.RU
- TD-SHIN@YANDEX.RU
- TEST1@TEST.BY
- TEST1235@MAIL.RU
- TEST123TEST@MAIL.RU
- TYREGPRICE@GMAIL.COM

#### Таблица: **AspNetUsers** (поле: UserName)
- a@a.com
- alexfrunz@gmail.com
- baza@road.by
- director@proshina.by
- extype@tut.by
- hrol.86@mail.ru
- info@rezina1.ru
- motopark-minsk@yandex.by
- N-Tyre.by
- ob@aspirity.com
- ob1@aspirity.com
- roman0000by@yandex.by
- roman555@tut.by
- shina@vaksi.by
- shina-2005@mail.ru
- statkevich_s@bk.ru
- test1@test.by
- test1235@mail.ru
- test123test@mail.ru

#### Таблица: **ChatMessages** (поле: Text)
- kolesaclub@yandex.ru

#### Таблица: **Customers** (поле: Name)
- 0000.BY
- 1T.BY
- coleso.by
- N-Tyre.by
- roma500@tut.by
- TyreG.by

#### Таблица: **OrderItems** (поле: image_url)
- https://example.com/images/bbs_ch-r.jpg
- https://example.com/images/bridgestone_turanza_t005.jpg
- https://example.com/images/continental_contipremiumcontact_5.jpg
- https://example.com/images/dunlop_sport_maxx_rt_2.jpg
- https://example.com/images/enkei_rpf1.jpg
- https://example.com/images/goodyear_eagle_f1_asymmetric_5.jpg
- https://example.com/images/hankook_ventus_s1_evo3.jpg
- https://example.com/images/michelin_primacy_4.jpg
- https://example.com/images/nokian_nordman_7.jpg
- https://example.com/images/oz racing_ultraleggera.jpg
- https://example.com/images/pirelli_p_zero.jpg
- https://example.com/images/skad_афина.jpg
- https://example.com/images/yokohama_advan_sport_v105.jpg

#### Таблица: **Orders** (поле: customer_email)
- ivanov@example.com
- kozlov@example.com
- kuznetsov@example.com
- morozova@example.com
- petrov@example.com
- sidorova@example.com
- sokolov@example.com
- volkova@example.com

#### Таблица: **ReservationCarts** (поле: Number)
- coleso.by-AZ-227194
- coleso.by-DZ-991309
- coleso.by-ET-946026
- coleso.by-NM-455595

### 🔍 Все найденные домены:
- 0000.BY
- 17ZEK91@MAIL.RU
- 17zek91@mail.ru
- 1T.BY
- A@A.COM
- ALEXFRUNZ@GMAIL.COM
- AUTO@21VEK.BY
- BAZA@ROAD.BY
- DIRECTOR@PROSHINA.BY
- EVSTRATOV.WHEELS@YANDEX.RU
- EXTYPE@TUT.BY
- HROL.86@MAIL.RU
- INFO@N-TYRE.BY
- INFO@REZINA1.RU
- MINSK5770017@YANDEX.BY
- MOTOPARK-MINSK@YANDEX.BY
- N-Tyre.by
- OB1@ASPIRITY.COM
- OB@ASPIRITY.COM
- ROMA500@TUT.BY
- ROMAN0000BY@YANDEX.BY
- ROMAN555@TUT.BY
- SHINA-2005@MAIL.RU
- SHINA@VAKSI.BY
- STATKEVICH_S@BK.RU
- TD-SHIN@YANDEX.RU
- TEST1235@MAIL.RU
- TEST123TEST@MAIL.RU
- TEST1@TEST.BY
- TYREGPRICE@GMAIL.COM
- TyreG.by
- a@a.com
- alexfrunz@gmail.com
- auto@21vek.by
- baza@road.by
- coleso.by
- coleso.by-AZ-227194
- coleso.by-DZ-991309
- coleso.by-ET-946026
- coleso.by-NM-455595
- director@proshina.by
- evstratov.wheels@yandex.ru
- extype@tut.by
- hrol.86@mail.ru
- https://example.com/images/bbs_ch-r.jpg
- https://example.com/images/bridgestone_turanza_t005.jpg
- https://example.com/images/continental_contipremiumcontact_5.jpg
- https://example.com/images/dunlop_sport_maxx_rt_2.jpg
- https://example.com/images/enkei_rpf1.jpg
- https://example.com/images/goodyear_eagle_f1_asymmetric_5.jpg
- https://example.com/images/hankook_ventus_s1_evo3.jpg
- https://example.com/images/michelin_primacy_4.jpg
- https://example.com/images/nokian_nordman_7.jpg
- https://example.com/images/oz racing_ultraleggera.jpg
- https://example.com/images/pirelli_p_zero.jpg
- https://example.com/images/skad_афина.jpg
- https://example.com/images/yokohama_advan_sport_v105.jpg
- info@n-tyre.by
- info@rezina1.ru
- ivanov@example.com
- kolesaclub@yandex.ru
- kozlov@example.com
- kuznetsov@example.com
- minsk5770017@yandex.by
- morozova@example.com
- motopark-minsk@yandex.by
- ob1@aspirity.com
- ob@aspirity.com
- petrov@example.com
- roma500@tut.by
- roman0000by@yandex.by
- roman555@tut.by
- shina-2005@mail.ru
- shina@vaksi.by
- sidorova@example.com
- sokolov@example.com
- statkevich_s@bk.ru
- td-shin@yandex.ru
- test1235@mail.ru
- test123test@mail.ru
- test1@test.by
- tyregprice@gmail.com
- volkova@example.com

---
*Поиск доменов выполнен: 02.09.2025, 09:02:17*
