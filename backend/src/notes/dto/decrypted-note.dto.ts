export class DecryptedNoteDto {
  constructor(partial: Partial<DecryptedNoteDto>) {
    Object.assign(this, partial);
  }
  id: string;
  body: string;
}
