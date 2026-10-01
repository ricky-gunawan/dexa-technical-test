import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, Min, isUUID } from 'class-validator';
import { DatabaseService } from '../database/database.service';

export class CreateAbsensiDto {
  @IsUUID() userId!: string;
  @IsIn(['masuk', 'pulang']) status!: 'masuk' | 'pulang';
}

export class AbsensiQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsISO8601({ strict: true }) from?: string;
  @IsOptional() @IsISO8601({ strict: true }) to?: string;
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export interface Absensi {
  id: string;
  userId: string;
  createdAt: Date;
  status: 'masuk' | 'pulang';
}

const columns = 'id, user_id AS "userId", created_at AS "createdAt", status';

type Cursor = { createdAt: Date; id: string };

function decodeCursor(value: string): Cursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as Record<string, unknown>;
    if (typeof parsed.createdAt !== 'string' || Number.isNaN(Date.parse(parsed.createdAt))) throw new Error();
    if (typeof parsed.id !== 'string' || !isUUID(parsed.id)) throw new Error();
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}

function encodeCursor(record: Absensi) {
  return Buffer.from(JSON.stringify({ createdAt: new Date(record.createdAt).toISOString(), id: record.id })).toString(
    'base64url',
  );
}

@Injectable()
export class AbsensiService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateAbsensiDto) {
    const { rows } = await this.database.query<Absensi>(
      `INSERT INTO absensi (user_id, status) VALUES ($1, $2) RETURNING ${columns}`,
      [input.userId, input.status],
    );
    return rows[0];
  }

  async findAll(input: AbsensiQueryDto) {
    const from = input.from ? new Date(input.from) : null;
    const to = input.to ? new Date(input.to) : null;
    if (from && to && from > to) throw new BadRequestException('from must not be after to');
    const cursor = input.cursor ? decodeCursor(input.cursor) : null;

    const { rows } = await this.database.query<Absensi>(
      `SELECT ${columns} FROM absensi
       WHERE ($1::timestamp IS NULL OR created_at >= $1)
         AND ($2::timestamp IS NULL OR created_at <= $2)
         AND ($3::timestamp IS NULL OR (created_at, id) < ($3, $4::uuid))
         AND ($5::uuid IS NULL OR user_id = $5)
       ORDER BY created_at DESC, id DESC
       LIMIT $6`,
      [from, to, cursor?.createdAt ?? null, cursor?.id ?? null, input.userId ?? null, input.limit + 1],
    );

    const data = rows.slice(0, input.limit);
    return {
      data,
      nextCursor: rows.length > input.limit ? encodeCursor(data[data.length - 1]) : null,
    };
  }

  async findOne(id: string) {
    const { rows } = await this.database.query<Absensi>(`SELECT ${columns} FROM absensi WHERE id = $1`, [id]);
    if (!rows[0]) throw new NotFoundException('Absensi not found');
    return rows[0];
  }
}
