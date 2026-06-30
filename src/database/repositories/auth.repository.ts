import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database.service';

export interface UserRecord {
  Id: string;
  Email: string;
  UserName: string;
  EmailConfirmed: boolean;
  NormalizedEmail: string;
  NormalizedUserName: string;
  PasswordHash: string;
  Roles: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const pool = this.databaseService.getPool();
    const result = await pool.request().input('email', sql.VarChar, email)
      .query(`
        SELECT
          u.Id,
          u.Email,
          u.UserName,
          u.EmailConfirmed,
          u.NormalizedEmail,
          u.NormalizedUserName,
          u.PasswordHash,
          STRING_AGG(r.Name, ',') as Roles
        FROM AspNetUsers u
        LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
        LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
        WHERE u.Email = @email
        GROUP BY u.Id, u.Email, u.UserName, u.EmailConfirmed, u.NormalizedEmail, u.NormalizedUserName, u.PasswordHash
      `);
    return (result.recordset[0] as UserRecord) ?? null;
  }
}
