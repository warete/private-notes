import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cipher, createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { Note as NoteModel, NoteDocument } from './schemas/note.schema';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(NoteModel.name) private noteModel: Model<NoteDocument>,
  ) {}

  async getAllForUser(user: UserDocument): Promise<NoteDocument[]> {
    return this.noteModel.find({ user: user.id }).exec();
  }

  async getById(id: string): Promise<NoteDocument> {
    return this.noteModel.findOne({ _id: id }).exec();
  }

  async createForUser(
    body: string,
    secretKey: string,
    user: UserDocument,
  ): Promise<NoteDocument> {
    const dateExpire = new Date();
    dateExpire.setDate(dateExpire.getDate() + 1);
    return this.noteModel.create({
      user: user.id,
      body: await this.cryptBody(body, secretKey),
      dateExpire: dateExpire,
    });
  }

  getRandomKey(): string {
    const max = 100000;
    const min = 10000;
    return '' + Math.random() * (max - min) + min;
  }

  async cryptBody(body: string, key: string): Promise<string> {
    const cipher = await this.getCipher(key);
    return Buffer.concat([cipher.update(body), cipher.final()]).toString(
      'utf8',
    );
  }

  private async getCipher(password: string): Promise<Cipher> {
    const iv = randomBytes(16);

    const key = (await promisify(scrypt)(password, 'notesSalt', 32)) as Buffer;
    return createCipheriv('aes-256-ctr', key, iv);
  }
}
