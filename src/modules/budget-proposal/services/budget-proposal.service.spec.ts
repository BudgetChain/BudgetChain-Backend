import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetProposalService } from './budget-proposal.service';
import { BudgetProposal } from '../entities/budget-proposal.entity';
import { User } from '../../user/entities/user.entity';
import { Budget as Treasury } from '../../treasury/entities/budget.entity';
import { BudgetProposalStatus } from '../entities/budget-proposal.entity';

describe('BudgetProposalService', () => {
  let service: BudgetProposalService;
  let mockRepository: Partial<
    Record<keyof Repository<BudgetProposal>, jest.Mock>
  >;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetProposalService,
        {
          provide: getRepositoryToken(BudgetProposal),
          useValue: mockRepository,
        },
        {
          provide: 'TreasuryService',
          useValue: {
            findOne: jest.fn().mockResolvedValue(new Treasury()),
          },
        },
      ],
    }).compile();

    service = module.get<BudgetProposalService>(BudgetProposalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new budget proposal', async () => {
      const createDto = {
        treasuryId: 'treasury-1',
        name: 'Test Proposal',
        description: 'Test Description',
        department: 'Test Department',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        requestedAmount: 1000,
        categories: [],
        metrics: [],
      };

      const user = new User();
      user.id = 'user-1';

      const expectedProposal = new BudgetProposal();
      Object.assign(expectedProposal, createDto);
      expectedProposal.submitterId = user.id;
      expectedProposal.status = BudgetProposalStatus.DRAFT;

      mockRepository.create.mockReturnValue(expectedProposal);
      mockRepository.save.mockResolvedValue(expectedProposal);

      const result = await service.create(createDto, user);
      expect(result).toEqual(expectedProposal);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        submitterId: user.id,
        status: BudgetProposalStatus.DRAFT,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedProposal);
    });
  });
});
