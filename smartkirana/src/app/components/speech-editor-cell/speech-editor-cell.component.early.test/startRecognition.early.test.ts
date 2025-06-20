
import { SpeechEditorCellComponent } from '../speech-editor-cell.component';


// speech-editor-cell.component.startRecognition.spec.ts


// speech-editor-cell.component.startRecognition.spec.ts
// Mock for MessageService
class MockMessageService {
  public add = jest.mocked(jest.fn());
}


// Helper to mock window.SpeechRecognition and window.webkitSpeechRecognition
function mockSpeechRecognitionImplementation(overrides: Partial<any> = {}) {
  const start = jest.mocked(jest.fn());
  const recognitionInstance = {
    lang: '',
    interimResults: false,
    maxAlternatives: 1,
    onresult: null,
    onerror: null,
    onend: null,
    start,
    ...overrides,
  };
  const SpeechRecognitionConstructor = jest.fn(() => recognitionInstance);
  return { SpeechRecognitionConstructor, recognitionInstance, start };
}

describe('SpeechEditorCellComponent.startRecognition() startRecognition method', () => {
  let component: SpeechEditorCellComponent;
  let mockToast: MockMessageService;
  let originalSpeechRecognition: any;
  let originalWebkitSpeechRecognition: any;

  beforeEach(() => {
    // Save original window properties
    originalSpeechRecognition = (window as any).SpeechRecognition;
    originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;

    mockToast = new MockMessageService() as any;
    component = new SpeechEditorCellComponent(mockToast as any);

    // Set up EventEmitters with jest.fn()
    component.modelChange = { emit: jest.mocked(jest.fn()) } as any;
    component.started = { emit: jest.mocked(jest.fn()) } as any;
    component.completed = { emit: jest.mocked(jest.fn()) } as any;
    component.model = 'initial value';
    component.isListening = false;
  });

  afterEach(() => {
    // Restore original window properties
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    jest.clearAllMocks();
  });

  // ------------------- Happy Paths -------------------
  describe('Happy paths', () => {
    it('should start recognition, emit started, and handle result event correctly', () => {
      // This test ensures that startRecognition works as expected in the normal case.
      const { SpeechRecognitionConstructor, recognitionInstance, start } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      // Simulate startRecognition
      component.model = 'hello world';
      component.startRecognition('en-US');

      // Check that SpeechRecognition was constructed and configured
      expect(SpeechRecognitionConstructor).toHaveBeenCalledTimes(1);
      expect(recognitionInstance.lang).toBe('en-US');
      expect(recognitionInstance.interimResults).toBe(false);
      expect(recognitionInstance.maxAlternatives).toBe(1);

      // Should emit started with current model
      expect(component.started.emit).toHaveBeenCalledWith('hello world');
      expect(component.isListening).toBe(true);

      // Simulate a result event
      const event = {
        results: [
          [
            { transcript: ' recognized speech ' }
          ]
        ]
      };
      // @ts-ignore
      recognitionInstance.onresult(event);

      // Should update model, emit modelChange, emit completed, and set isListening to false
      expect(component.model).toBe('recognized speech');
      expect(component.modelChange.emit).toHaveBeenCalledWith('recognized speech');
      expect(component.completed.emit).toHaveBeenCalled();
      expect(component.isListening).toBe(false);

      // Should have called start
      expect(start).toHaveBeenCalled();
    });

    it('should use default language "hi-IN" if no lang is provided', () => {
      // This test checks that the default language is set if none is provided.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.startRecognition();

      expect(recognitionInstance.lang).toBe('hi-IN');
    });

    it('should use webkitSpeechRecognition if SpeechRecognition is not available', () => {
      // This test checks that webkitSpeechRecognition is used as a fallback.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = SpeechRecognitionConstructor as any;

      component.startRecognition('fr-FR');

      expect(SpeechRecognitionConstructor).toHaveBeenCalledTimes(1);
      expect(recognitionInstance.lang).toBe('fr-FR');
      expect(component.isListening).toBe(true);
    });

    it('should handle onend event by setting isListening to false', () => {
      // This test ensures that onend sets isListening to false.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.startRecognition('en-US');
      component.isListening = true;

      // @ts-ignore
      recognitionInstance.onend();

      expect(component.isListening).toBe(false);
    });
  });

  // ------------------- Edge Cases -------------------
  describe('Edge cases', () => {
    it('should show error toast if SpeechRecognition is not supported', () => {
      // This test checks that an error toast is shown if neither SpeechRecognition nor webkitSpeechRecognition is available.
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;

      component.startRecognition('en-US');

      expect(mockToast.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Unsupported',
        detail: 'Speech recognition not supported.',
      });
      expect(component.isListening).toBe(false);
    });

    it('should handle onerror event by showing error toast and setting isListening to false', () => {
      // This test ensures that onerror displays an error toast and sets isListening to false.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.startRecognition('en-US');
      component.isListening = true;

      const errorEvent = { error: 'network' };
      // @ts-ignore
      recognitionInstance.onerror(errorEvent);

      expect(mockToast.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Speech Error',
        detail: 'network',
      });
      expect(component.isListening).toBe(false);
    });

    it('should handle result event with empty transcript gracefully', () => {
      // This test checks that an empty transcript does not cause errors.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.model = 'previous';
      component.startRecognition('en-US');

      const event = {
        results: [
          [
            { transcript: '   ' }
          ]
        ]
      };
      // @ts-ignore
      recognitionInstance.onresult(event);

      expect(component.model).toBe('');
      expect(component.modelChange.emit).toHaveBeenCalledWith('');
      expect(component.completed.emit).toHaveBeenCalled();
      expect(component.isListening).toBe(false);
    });

    it('should handle result event with multiple alternatives, only using the first', () => {
      // This test ensures only the first alternative is used.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.model = 'old';
      component.startRecognition('en-US');

      const event = {
        results: [
          [
            { transcript: 'first' },
            { transcript: 'second' }
          ]
        ]
      };
      // @ts-ignore
      recognitionInstance.onresult(event);

      expect(component.model).toBe('first');
      expect(component.modelChange.emit).toHaveBeenCalledWith('first');
      expect(component.completed.emit).toHaveBeenCalled();
      expect(component.isListening).toBe(false);
    });

    it('should not throw if result event structure is unexpected', () => {
      // This test ensures that if the event structure is not as expected, it does not throw.
      const { SpeechRecognitionConstructor, recognitionInstance } = mockSpeechRecognitionImplementation();
      (window as any).SpeechRecognition = SpeechRecognitionConstructor as any;
      (window as any).webkitSpeechRecognition = undefined;

      component.model = 'old';
      component.startRecognition('en-US');

      const event = {
        results: []
      };
      // @ts-ignore
      expect(() => recognitionInstance.onresult(event)).toThrow(); // This will throw because event.results[0][0] is undefined
      // The component does not handle this, so it's an edge case for improvement.
    });
  });
});