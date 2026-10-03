import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  isUUID,
} from "class-validator";
import { DatabaseService } from "../database/database.service";
import { UserUpdateEventsService } from "./user-update-events.service";

export class CreateUserDto {
  @IsString() @MinLength(1) name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsUrl({ require_tld: false }) photoURL?: string;
  @IsString() @MinLength(1) position!: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsString() @MinLength(8) password!: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUrl({ require_tld: false }) photoURL?: string;
  @IsOptional() @IsString() @MinLength(1) position?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}

export class UserQueryDto {
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) password!: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  position: string;
  phoneNumber: string | null;
}

interface UserWithPassword extends User {
  password: string;
}

const columns =
  'id, name, email, photo_url AS "photoURL", position, phone_number AS "phoneNumber"';
const dummyPassword =
  "$2b$10$GnSJTwq3cab/9h3M.t1ys.k4H2zGBMQizDoLH/B6hcPCpCj6Gzojy";

function decodeCursor(value: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString(),
    ) as Record<string, unknown>;
    if (typeof parsed.name !== "string") throw new Error();
    if (typeof parsed.id !== "string" || !isUUID(parsed.id)) throw new Error();
    return { name: parsed.name, id: parsed.id };
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
}

function encodeCursor(user: User) {
  return Buffer.from(JSON.stringify({ name: user.name, id: user.id })).toString(
    "base64url",
  );
}

@Injectable()
export class UserService {
  constructor(
    private readonly database: DatabaseService,
    private readonly events: UserUpdateEventsService,
  ) {}

  async authenticate(input: LoginDto) {
    const { rows } = await this.database.query<UserWithPassword>(
      `SELECT ${columns}, password FROM "user" WHERE email = $1`,
      [input.email],
    );
    const valid = await compare(
      input.password,
      rows[0]?.password ?? dummyPassword, // using dummyPassword here to prevent timing attacks
    );
    if (!rows[0] || !valid)
      throw new UnauthorizedException("Invalid email or password");
    const { password: _password, ...user } = rows[0];
    return user;
  }

  async create(input: CreateUserDto) {
    const password = await hash(input.password, 10);
    const { rows } = await this.database.query<User>(
      `INSERT INTO "user" (name, email, photo_url, position, phone_number, password)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${columns}`,
      [
        input.name,
        input.email,
        input.photoURL ?? null,
        input.position,
        input.phoneNumber ?? null,
        password,
      ],
    );
    return rows[0];
  }

  async findAll(input: UserQueryDto) {
    const cursor = input.cursor ? decodeCursor(input.cursor) : null;
    const { rows } = await this.database.query<User>(
      `SELECT ${columns} FROM "user"
       WHERE ($1::text IS NULL OR (name, id) > ($1, $2::uuid))
       ORDER BY name, id
       LIMIT $3`,
      [cursor?.name ?? null, cursor?.id ?? null, input.limit + 1],
    );
    const data = rows.slice(0, input.limit);
    return {
      data,
      nextCursor:
        rows.length > input.limit ? encodeCursor(data[data.length - 1]) : null,
    };
  }

  async findOne(id: string) {
    const { rows } = await this.database.query<User>(
      `SELECT ${columns} FROM "user" WHERE id = $1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException("User not found");
    return rows[0];
  }

  async update(id: string, input: UpdateUserDto) {
    const password = input.password ? await hash(input.password, 10) : null;
    const { rows } = await this.database.query<User>(
      `UPDATE "user" SET
         name = COALESCE($2, name), email = COALESCE($3, email),
         photo_url = COALESCE($4, photo_url), position = COALESCE($5, position),
         phone_number = COALESCE($6, phone_number), password = COALESCE($7, password)
       WHERE id = $1 RETURNING ${columns}`,
      [
        id,
        input.name ?? null,
        input.email ?? null,
        input.photoURL ?? null,
        input.position ?? null,
        input.phoneNumber ?? null,
        password,
      ],
    );
    if (!rows[0]) throw new NotFoundException("User not found");
    const { password: changedPassword, ...changes } = input;
    await this.events.publish(id, {
      ...changes,
      ...(changedPassword !== undefined && { passwordChanged: true }),
    });
    return rows[0];
  }

  async remove(id: string) {
    const { rowCount } = await this.database.query(
      'DELETE FROM "user" WHERE id = $1',
      [id],
    );
    if (!rowCount) throw new NotFoundException("User not found");
  }
}
