
import { OrderParserService } from '../../../services/order-parser.service';
import { SpeechService } from '../../../services/speech.service';
import { VoiceOrderComponent } from '../voice-order.component';


// voice-order.component.startListening.spec.ts
// Mock interface for Blob
interface MockBlob {
  size: number;
  type: string;
  slice: jest.Mock<any, any>;
}
function createMockBlob(): MockBlob {
  return {
    size: 123,
    type: 'audio/wav',
    slice: jest.fn(),
  };
}

// Mock interface for Component (not directly used in startListening, but provided as per instruction)
// Manual Jest mock for SpeechService

// Manual Jest mock for OrderParserService (no methods used in startListening, but required for constructor)

describe('VoiceOrderComponent.startListening() startListening method', () => {
  let component: VoiceOrderComponent;
  let speechService: jest.Mocked<SpeechService>;
  let orderParser: jest.Mocked<OrderParserService>;

  beforeEach(() => {
    // Reset mocks before each test
    speechService = {
      startListening: jest.fn(),
      speech$: {
        subscribe: jest.fn(),
      },
    } as unknown as jest.Mocked<SpeechService>;

    orderParser = {} as unknown as jest.Mocked<OrderParserService>;

    component = new VoiceOrderComponent(speechService as any, orderParser as any);
  });

  // Happy Path Tests
  describe('Happy paths', () => {
    it('should set isListening to true and call speechService.startListening', () => {
      // This test ensures that startListening sets isListening to true and calls the service method.
      component.isListening = false;
      jest.mocked(speechService.startListening).mockClear();

      component.startListening();

      expect(component.isListening).toBe(true);
      expect(jest.mocked(speechService.startListening)).toHaveBeenCalledTimes(1);
    });

    it('should call speechService.startListening every time startListening is called', () => {
      // This test ensures that multiple calls to startListening always call the service method.
      jest.mocked(speechService.startListening).mockClear();

      component.startListening();
      component.startListening();

      expect(jest.mocked(speechService.startListening)).toHaveBeenCalledTimes(2);
      expect(component.isListening).toBe(true);
    });

    it('should not affect recognizedText or parsedOrder when called', () => {
      // This test ensures that startListening does not modify unrelated properties.
      component.recognizedText = 'existing text';
      component.parsedOrder = [
        { name: 'item', quantity: 1, unit: 'kg', price: 10, isRowInValid: false },
      ];

      component.startListening();

      expect(component.recognizedText).toBe('existing text');
      expect(component.parsedOrder).toEqual([
        { name: 'item', quantity: 1, unit: 'kg', price: 10, isRowInValid: false },
      ]);
    });
  });

  // Edge Case Tests
  describe('Edge cases', () => {
    it('should set isListening to true even if already true', () => {
      // This test ensures that calling startListening when isListening is already true does not change the outcome.
      component.isListening = true;
      jest.mocked(speechService.startListening).mockClear();

      component.startListening();

      expect(component.isListening).toBe(true);
      expect(jest.mocked(speechService.startListening)).toHaveBeenCalledTimes(1);
    });

    it('should handle when speechService.startListening throws an error', () => {
      // This test ensures that if the service throws, isListening is still set to true.
      jest.mocked(speechService.startListening).mockImplementation(() => {
        throw new Error('Simulated error');
      });

      component.isListening = false;

      expect(() => component.startListening()).toThrow('Simulated error');
      expect(component.isListening).toBe(true);
    });

    it('should not interact with itemAudios, fullRecordingAudio, or unMatchedItems', () => {
      // This test ensures that unrelated properties are not changed.
      component.itemAudios = { 1: createMockBlob() as any };
      component.fullRecordingAudio = createMockBlob() as any;
      component.unMatchedItems = [{ name: 'unmatched' }];

      component.startListening();

      expect(component.itemAudios).toEqual({ 1: expect.any(Object) });
      expect(component.fullRecordingAudio).toEqual(expect.any(Object));
      expect(component.unMatchedItems).toEqual([{ name: 'unmatched' }]);
    });
  });
});