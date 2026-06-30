import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database.service';

export interface PhotoRecord {
  ModelId: number;
  photoPath: string;
}

@Injectable()
export class PhotoRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPhotosByModelIds(modelIds: number[]): Promise<PhotoRecord[]> {
    if (modelIds.length === 0) return [];

    const pool = this.databaseService.getPool();
    const placeholders = modelIds.map((_, i) => `@modelId${i}`).join(',');

    const request = pool.request();
    modelIds.forEach((id, i) => request.input(`modelId${i}`, sql.Int, id));

    const result = await request.query(`
      SELECT mp.ModelId, mp.Path as photoPath
      FROM ModelPhotos mp
      WHERE mp.ModelId IN (${placeholders})
        AND mp.ShowInCatalog = 1
      ORDER BY mp.IsMain DESC
    `);

    return result.recordset as PhotoRecord[];
  }
}
