import { render, screen, fireEvent } from '@testing-library/react';
import LibraryItemRow from './LibraryItemRow';
import { vi } from 'vitest';

describe('LibraryItemRow', () => {
    const mockItem = {
        id: 1,
        name: 'Test Item',
        type: 'FOOD',
        calories: 100,
        description: 'Test Description'
    };

    const defaultProps = {
        item: mockItem,
        isSelected: false,
        currentCount: 1,
        currentMinutes: 30,
        onSelect: vi.fn(),
        onAdjust: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn()
    };

    it('renders item details correctly in view mode', () => {
        render(<LibraryItemRow {...defaultProps} />);
        expect(screen.getByText('Test Item')).toBeInTheDocument();
        expect(screen.getByText(/100 kcal/)).toBeInTheDocument();
        expect(screen.getByText(/- Test Description/)).toBeInTheDocument();
    });

    it('switches to edit mode and saves changes', () => {
        render(<LibraryItemRow {...defaultProps} />);

        // Enter edit mode
        const editBtn = screen.getByTitle('Edit');
        fireEvent.click(editBtn);

        // Inputs should be visible
        const nameInput = screen.getByDisplayValue('Test Item');
        expect(nameInput).toBeInTheDocument();

        // Change values
        fireEvent.change(nameInput, { target: { value: 'Updated Item' } });

        // Save
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        expect(defaultProps.onUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
            name: 'Updated Item'
        }));
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<LibraryItemRow {...defaultProps} />);

        const deleteBtn = screen.getByTitle('Delete');
        fireEvent.click(deleteBtn);

        expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
    });

    it('adjusts count in view mode', () => {
        render(<LibraryItemRow {...defaultProps} />);

        const addBtn = screen.getByText('add'); // material symbol
        fireEvent.click(addBtn);

        expect(defaultProps.onAdjust).toHaveBeenCalledWith(1, 'count', 2);
    });
});
