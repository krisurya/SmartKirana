
import { ItemEntryComponent } from '../item-entry.component';


// item-entry.component.removeRow.spec.ts
// Mock for FormArray
class MockFormArray {
  public removeAt = jest.mocked(jest.fn());
  public controls: any[] = [];
}

// Mock for FormBuilder
class MockFormBuilder {
  public group = jest.mocked(jest.fn());
  public array = jest.mocked(jest.fn());
}

// Mock for FormGroup (not directly used but for completeness)



describe('ItemEntryComponent.removeRow() removeRow method', () => {
  // Happy Paths
  describe('Happy paths', () => {
    it('should remove the row at the specified index (middle of array)', () => {
      // This test ensures that removeAt is called with the correct index when removing a row in the middle.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(1);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(1);
    });

    it('should remove the first row (index 0)', () => {
      // This test ensures that removeAt is called with index 0 when removing the first row.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 },
        { id: 2 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(0);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(0);
    });

    it('should remove the last row (index = length - 1)', () => {
      // This test ensures that removeAt is called with the last index when removing the last row.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(2);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(2);
    });
  });

  // Edge Cases
  describe('Edge cases', () => {
    it('should call removeAt even if controls array is empty', () => {
      // This test ensures that removeAt is still called even if the controls array is empty.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(0);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(0);
    });

    it('should call removeAt with a negative index', () => {
      // This test ensures that removeAt is called with a negative index, which is an edge case.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 },
        { id: 2 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(-1);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(-1);
    });

    it('should call removeAt with an index greater than controls length', () => {
      // This test ensures that removeAt is called with an out-of-bounds index.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(5);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(5);
    });

    it('should call removeAt with a very large index', () => {
      // This test ensures that removeAt is called with a very large index.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(9999);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(9999);
    });

    it('should call removeAt with index 0 when only one control exists', () => {
      // This test ensures that removeAt is called with index 0 when there is only one control.
      const mockFormArray = new MockFormArray() as any;
      mockFormArray.controls = [
        { id: 1 }
      ];
      const mockFormBuilder = new MockFormBuilder() as any;
      const component = new ItemEntryComponent(mockFormBuilder as any);
      component.formArray = mockFormArray as any;

      component.removeRow(0);

      expect(mockFormArray.removeAt).toHaveBeenCalledTimes(1);
      expect(mockFormArray.removeAt).toHaveBeenCalledWith(0);
    });
  });
});