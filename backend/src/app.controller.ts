import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { diskStorage } from "multer";
import { interval, map, merge, Observable } from "rxjs";
import {
  AbsensiQueryDto,
  AbsensiService,
  CreateAbsensiDto,
} from "./absensi/absensi.service";
import { DatabaseService } from "./database/database.service";
import { Public } from "./jwt-auth.guard";
import { MessageBrokerService } from "./message-broker/message-broker.service";
import {
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  UserQueryDto,
  UserService,
} from "./user/user.service";
import { UserUpdateEventsService } from "./user/user-update-events.service";

const uploadsDirectory = join(process.cwd(), ".uploads");
mkdirSync(uploadsDirectory, { recursive: true });

const imageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

@Controller()
export class AppController {
  constructor(
    private readonly database: DatabaseService,
    private readonly messageBroker: MessageBrokerService,
    private readonly user: UserService,
    private readonly absensi: AbsensiService,
    private readonly jwt: JwtService,
    private readonly userUpdates: UserUpdateEventsService,
  ) {}

  @Public()
  @Get("health")
  async getHealth() {
    const [database, messageBroker] = await Promise.all([
      this.database.health(),
      this.messageBroker.health(),
    ]);
    return { status: "ok", database, messageBroker };
  }

  @Public()
  @Post("login")
  async login(@Body() input: LoginDto) {
    const user = await this.user.authenticate(input);
    return {
      access_token: await this.jwt.signAsync({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  @Post("upload/profile-photo")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: uploadsDirectory,
        filename: (_request, file, callback) =>
          callback(
            null,
            `${randomUUID()}${imageExtensions[file.mimetype] ?? ""}`,
          ),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!imageExtensions[file.mimetype]) {
          return callback(
            new BadRequestException(
              "Only JPEG, PNG, and WebP images are allowed",
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
  ) {
    if (!file) throw new BadRequestException("Photo is required");
    // ponytail: uploaded files are retained; add lifecycle cleanup if storage growth matters.
    return {
      url: `${request.protocol}://${request.get("host")}/uploads/${file.filename}`,
    };
  }

  @Post("user")
  createUser(@Body() input: CreateUserDto) {
    return this.user.create(input);
  }

  @Get("user")
  getUsers(@Query() query: UserQueryDto) {
    return this.user.findAll(query);
  }

  @Get("user/:id")
  getUserById(@Param("id", ParseUUIDPipe) id: string) {
    return this.user.findOne(id);
  }

  @Patch("user/:id")
  updateUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() input: UpdateUserDto,
  ) {
    return this.user.update(id, input);
  }

  @Delete("user/:id")
  @HttpCode(204)
  removeUser(@Param("id", ParseUUIDPipe) id: string) {
    return this.user.remove(id);
  }

  @Post("absensi")
  createAbsensi(@Body() input: CreateAbsensiDto) {
    return this.absensi.create(input);
  }

  @Get("absensi")
  getAbsensi(@Query() query: AbsensiQueryDto) {
    return this.absensi.findAll(query);
  }

  @Get("absensi/:id")
  getAbsensiById(@Param("id", ParseUUIDPipe) id: string) {
    return this.absensi.findOne(id);
  }

  @Sse("events")
  events(): Observable<MessageEvent> {
    return merge(
      this.userUpdates.stream(),
      interval(1000).pipe(
        map(() => ({
          type: "heartbeat",
          data: { timestamp: new Date().toISOString() },
        })),
      ),
    );
  }
}
