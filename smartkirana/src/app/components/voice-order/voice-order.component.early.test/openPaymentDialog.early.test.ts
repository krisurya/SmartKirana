
import { LoaderService } from '../../../services/loader.service';
import { OrderParserService } from '../../../services/order-parser.service';
import { SpeechService } from '../../../services/speech.service';
import { GlobalToastService } from '../../../services/toast.service';
import { VoiceOrderComponent } from '../voice-order.component';


// voice-order.component.openPaymentDialog.spec.ts


// voice-order.component.openPaymentDialog.spec.ts
// Manual mocks for complex dependencies


class MockActivatedRoute {
  public snapshot: any = {};
}





// Jest mocks for service dependencies
const mockSpeechService = {
  // Add methods as needed
} as unknown as jest.Mocked<SpeechService>;

const mockOrderParserService = {
  // Add methods as needed
} as unknown as jest.Mocked<OrderParserService>;

const mockLoaderService = {
  // Add methods as needed
} as unknown as jest.Mocked<LoaderService>;

const mockGlobalToastService = {
  // Add methods as needed
} as unknown as jest.Mocked<GlobalToastService>;

// Helper to create a VoiceOrderComponent with injected mocks
function createComponentInstance(overrides: Partial<VoiceOrderComponent> = {}) {
  const component = new VoiceOrderComponent(
    new MockActivatedRoute() as any,
    mockSpeechService,
    mockOrderParserService,
    mockLoaderService,
    mockGlobalToastService
  );
  // Apply overrides for test customization
  Object.assign(component, overrides);
  return component;
}

describe('VoiceOrderComponent.openPaymentDialog() openPaymentDialog method', () => {
  // Happy Path Tests
  describe('Happy paths', () => {
    it('should set paidAmount to calculatedTotal, remainingAmount to 0, dueDateTime to default, and paymentDialogVisible to true for a valid order', () => {
      // This test ensures the method sets all payment dialog fields correctly for a typical valid order.
      const validOrder = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 2,
          unit: 'kg',
          price: 50,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '2',
          canonical: 'dal',
          english: 'Dal',
          quantity: 1,
          unit: 'kg',
          price: 100,
          isRowInValid: false,
          deleted: false
        }
      ];
      const component = createComponentInstance({
        parsedOrder: validOrder as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      expect(component.calculatedTotal).toBe(2 * 50 + 1 * 100);
      expect(component.paidAmount).toBe(200);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should set paidAmount to 0 if there are no valid items in parsedOrder', () => {
      // This test ensures that if there are no valid items, paidAmount is set to 0.
      const invalidOrder = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 0,
          unit: 'kg',
          price: 0,
          isRowInValid: true,
          deleted: false
        }
      ];
      const component = createComponentInstance({
        parsedOrder: invalidOrder as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      expect(component.calculatedTotal).toBe(0);
      expect(component.paidAmount).toBe(0);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should ignore deleted items and only sum valid, non-deleted items', () => {
      // This test ensures that deleted items are not included in the total.
      const order = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 2,
          unit: 'kg',
          price: 50,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '2',
          canonical: 'dal',
          english: 'Dal',
          quantity: 1,
          unit: 'kg',
          price: 100,
          isRowInValid: false,
          deleted: true // Should be ignored
        }
      ];
      const component = createComponentInstance({
        parsedOrder: order as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      expect(component.calculatedTotal).toBe(2 * 50);
      expect(component.paidAmount).toBe(100);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should set dueDateTime to a new date object each time openPaymentDialog is called', () => {
      // This test ensures that dueDateTime is set to a new date object each call.
      const order = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 1,
          unit: 'kg',
          price: 10,
          isRowInValid: false,
          deleted: false
        }
      ];
      const component = createComponentInstance({
        parsedOrder: order as any
      });

      // Spy on getDefaultDueDate to return a new date each time
      const mockDueDate1 = new Date('2025-01-01T00:00:00Z');
      const mockDueDate2 = new Date('2025-02-01T00:00:00Z');
      const getDefaultDueDateSpy = jest
        .spyOn(component, 'getDefaultDueDate' as any)
        .mockReturnValueOnce(mockDueDate1)
        .mockReturnValueOnce(mockDueDate2);

      component.openPaymentDialog();
      expect(component.dueDateTime).toBe(mockDueDate1);

      component.openPaymentDialog();
      expect(component.dueDateTime).toBe(mockDueDate2);

      expect(getDefaultDueDateSpy).toHaveBeenCalledTimes(2);
    });
  });

  // Edge Case Tests
  describe('Edge cases', () => {
    it('should handle parsedOrder with mixed valid and invalid items', () => {
      // This test ensures only valid, non-deleted items are included in the total.
      const order = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 2,
          unit: 'kg',
          price: 50,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '2',
          canonical: 'dal',
          english: 'Dal',
          quantity: 0,
          unit: 'kg',
          price: 100,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '3',
          canonical: 'atta',
          english: 'Atta',
          quantity: 1,
          unit: 'kg',
          price: 0,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '4',
          canonical: 'sugar',
          english: 'Sugar',
          quantity: 1,
          unit: 'kg',
          price: 40,
          isRowInValid: false,
          deleted: true
        }
      ];
      const component = createComponentInstance({
        parsedOrder: order as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      // Only the first item is valid and not deleted
      expect(component.calculatedTotal).toBe(2 * 50);
      expect(component.paidAmount).toBe(100);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should handle empty parsedOrder array', () => {
      // This test ensures that an empty order results in zero amounts and a valid due date.
      const component = createComponentInstance({
        parsedOrder: [] as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      expect(component.calculatedTotal).toBe(0);
      expect(component.paidAmount).toBe(0);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should handle parsedOrder with all items marked as deleted', () => {
      // This test ensures that if all items are deleted, the total is zero.
      const order = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: 2,
          unit: 'kg',
          price: 50,
          isRowInValid: false,
          deleted: true
        },
        {
          id: '2',
          canonical: 'dal',
          english: 'Dal',
          quantity: 1,
          unit: 'kg',
          price: 100,
          isRowInValid: false,
          deleted: true
        }
      ];
      const component = createComponentInstance({
        parsedOrder: order as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      expect(component.calculatedTotal).toBe(0);
      expect(component.paidAmount).toBe(0);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });

    it('should handle parsedOrder with negative price or quantity (should be filtered out)', () => {
      // This test ensures that items with negative price or quantity are not included in the total.
      const order = [
        {
          id: '1',
          canonical: 'rice',
          english: 'Rice',
          quantity: -2,
          unit: 'kg',
          price: 50,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '2',
          canonical: 'dal',
          english: 'Dal',
          quantity: 1,
          unit: 'kg',
          price: -100,
          isRowInValid: false,
          deleted: false
        },
        {
          id: '3',
          canonical: 'atta',
          english: 'Atta',
          quantity: 1,
          unit: 'kg',
          price: 40,
          isRowInValid: false,
          deleted: false
        }
      ];
      const component = createComponentInstance({
        parsedOrder: order as any
      });

      // Spy on getDefaultDueDate to control the date
      const mockDueDate = new Date('2025-01-01T00:00:00Z');
      jest.spyOn(component, 'getDefaultDueDate' as any).mockReturnValue(mockDueDate);

      component.openPaymentDialog();

      // Only the third item is valid
      expect(component.calculatedTotal).toBe(1 * 40);
      expect(component.paidAmount).toBe(40);
      expect(component.remainingAmount).toBe(0);
      expect(component.dueDateTime).toBe(mockDueDate);
      expect(component.paymentDialogVisible).toBe(true);
    });
  });
});