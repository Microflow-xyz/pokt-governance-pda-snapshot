import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonProvider } from '@common/winston/winston.provider';
import { AllExceptionsFilter } from '../all-exception.filter';

// Mock the WinstonProvider
jest.mock('@common/winston/winston.provider');

// Describe the test suite for the AllExceptionsFilter
describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: WinstonProvider;
  let hostMock: ArgumentsHost;
  let applicationRefMock: any;

  // Setup before each test
  beforeEach(async () => {
    // Create a testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter, WinstonProvider],
    }).compile();

    // Initialize instances for testing
    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    logger = module.get<WinstonProvider>(WinstonProvider);

    // Mock the host and applicationRef
    hostMock = {
      getArgByIndex: jest.fn(() => ({ headersSent: false })),
    } as unknown as ArgumentsHost;
    applicationRefMock = {
      isHeadersSent: jest.fn(() => false),
      reply: jest.fn(),
      end: jest.fn(),
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to check if the filter is defined
  test('Should be defined', () => {
    expect(filter).toBeDefined();
  });

  // Describe the 'handleUnknownError' method tests
  describe('handleUnknownError', () => {
    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(filter.handleUnknownError).toBeDefined();
    });

    // Test to check if the method handles unknown error, logs it, and responds appropriately
    test('Should handle unknown error and log it', () => {
      const exception = new Error('Test error');
      filter.handleUnknownError(exception, hostMock, applicationRefMock);

      // Assertions for response handling and logging
      expect(applicationRefMock.isHeadersSent).toHaveBeenCalled();
      expect(applicationRefMock.reply).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: expect.any(String),
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(logger.error).toHaveBeenCalledWith(exception.message, {
        context: 'ExceptionHandler',
        stack: exception.stack,
      });
    });

    // Test to check if the method ends the response if headers are already sent and calls error method from logger when exception is an object
    test('Should end the response if headers are already sent and call error method from logger when exception is an object', () => {
      const exception = new Error('Test error');
      applicationRefMock.isHeadersSent = jest.fn(() => true);
      filter.handleUnknownError(exception, hostMock, applicationRefMock);
      expect(applicationRefMock.end).toHaveBeenCalledWith(expect.anything());
      expect(applicationRefMock.reply).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    // Test to check if the method ends the response if headers are already sent and calls error method from logger when exception is not an object
    test('Should end the response if headers are already sent and call error method from logger when exception is not an object', () => {
      const exception = new Error('Test error');
      applicationRefMock.isHeadersSent = jest.fn(() => true);
      filter.handleUnknownError(
        String(exception),
        hostMock,
        applicationRefMock,
      );
      expect(applicationRefMock.end).toHaveBeenCalledWith(expect.anything());
      expect(applicationRefMock.reply).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
