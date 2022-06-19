import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Cipher,
  createCipheriv,
  createDecipheriv,
  Decipher,
  randomBytes,
  scrypt,
} from 'crypto';
import { promisify } from 'util';
import { Note as NoteModel, NoteDocument } from './schemas/note.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { NoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  protected cipherIv: Buffer;
  constructor(
    @InjectModel(NoteModel.name) private noteModel: Model<NoteDocument>,
  ) {
    this.cipherIv = Buffer.from('0123456789012345');
  }

  async getAllForUser(user: UserDocument): Promise<NoteDocument[]> {
    return this.noteModel.find({ user: user.id }).exec();
  }

  async getById(id: string): Promise<NoteDocument> {
    return this.noteModel.findOne({ _id: id }).exec();
  }

  async createForUser(
    body: string,
    dateExpire: Date,
    secretKey: string,
    user: UserDocument,
  ): Promise<NoteDocument> {
    return this.noteModel.create({
      user: user.id,
      body: await this.cryptBody(body, secretKey),
      dateExpire: dateExpire,
    });
  }

  async update(note: NoteDocument): Promise<NoteDocument> {
    return note.save();
  }

  documentToDto(doc: NoteDocument): NoteDto {
    return new NoteDto({
      id: doc.id,
      body: doc.body,
      dateExpire: doc.dateExpire,
      readAttemptsCount: doc.readAttemptsCount,
    });
  }

  getRandomKey(): string {
    const max = 100000;
    const min = 10000;
    return '' + Math.floor(Math.random() * (max - min) + min);
  }

  async cryptBody(body: string, key: string): Promise<string> {
    const cipher: Cipher = await this.getCipher(key);
    return [cipher.update(body, 'utf8', 'hex'), cipher.final('hex')].join('');
  }

  async decryptBody(cryptedBody: string, key: string): Promise<string> {
    const decipher: Decipher = await this.getDecipher(key);

    return [
      decipher.update(cryptedBody, 'hex', 'utf8'),
      decipher.final('utf8'),
    ].join('');
  }

  protected async normalizeKey(key: string): Promise<Buffer> {
    return (await promisify(scrypt)(key, 'notesSalt', 32)) as Buffer;
  }

  protected async getCipher(password: string): Promise<Cipher> {
    const key = await this.normalizeKey(password);
    return createCipheriv('aes-256-ctr', key, this.cipherIv);
  }

  protected async getDecipher(password: string): Promise<Decipher> {
    const key = await this.normalizeKey(password);
    return createDecipheriv('aes-256-ctr', key, this.cipherIv);
  }
}
