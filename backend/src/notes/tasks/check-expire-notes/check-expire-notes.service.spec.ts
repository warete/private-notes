import { Test, TestingModule } from '@nestjs/testing';
import { CheckExpireNotesService } from './check-expire-notes.service';

describe('CheckExpireNotesService', () => {
  let service: CheckExpireNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckExpireNotesService],
    }).compile();

    service = module.get<CheckExpireNotesService>(CheckExpireNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
