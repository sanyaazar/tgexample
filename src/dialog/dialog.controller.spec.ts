import { Test, TestingModule } from '@nestjs/testing';
import { DialogController } from './dialog.controller';
import { DialogService } from './dialog.service';

describe('DialogController', () => {
  let controller: DialogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DialogController],
      providers: [DialogService],
    }).compile();

    controller = module.get<DialogController>(DialogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
