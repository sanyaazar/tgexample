import { Test, TestingModule } from '@nestjs/testing';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DialogService],
    }).compile();

    service = module.get<DialogService>(DialogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
