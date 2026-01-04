import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import LibraryModal from './LibraryModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB hook
vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: (querier) => {
        // We can simulate the result of the query here
        // But since the component calls query inside, we need to return something valid
        // For simplicity, we can mock the hook to return a static list if we want, 
        // OR we can rely on the fact that we'll mock the data source.
        // However, the component defines the query inside.
        // Let's just mock the return value.
        return [
            { id: 1, name: 'Banana', type: 'FOOD', calories: 105, description: 'Medium' },
            { id: 2, name: 'Running', type: 'EXERCISE', calories: 300, minutes: 30, description: 'Moderate' },
            { id: 3, name: 'Apple', type: 'FOOD', calories: 95 },
        ];
    }
}));

// Mock DB
vi.mock('../db', () => ({
    db: {
        library: {
            toCollection: () => ({
                toArray: () => Promise.resolve([])
            })
        }
    }
}));

describe('LibraryModal', () => {
    const mockOnClose = vi.fn();
    const mockOnAdd = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when not open', () => {
        render(<LibraryModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />);
        expect(screen.queryByText('Add from Library')).toBeNull();
    });

    it('renders items when open', () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
        expect(screen.getByText('Add from Library')).toBeDefined();
        expect(screen.getByText('Banana')).toBeDefined();
        expect(screen.getByText('Running')).toBeDefined();
    });

    it('filters by search', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
        const input = screen.getByPlaceholderText('Search food or exercise...');
        fireEvent.change(input, { target: { value: 'run' } });

        expect(screen.queryByText('Banana')).toBeNull();
        expect(screen.getByText('Running')).toBeDefined();
    });

    it('filters by type', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

        fireEvent.click(screen.getByText('Foods Only'));
        expect(screen.getByText('Banana')).toBeDefined();
        expect(screen.queryByText('Running')).toBeNull();

        fireEvent.click(screen.getByText('Exercises Only'));
        expect(screen.queryByText('Banana')).toBeNull();
        expect(screen.getByText('Running')).toBeDefined();
    });

    it('selects and adds items', () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

        // Find checkboxes (this might need specific selector if multiple inputs)
        // Accessing the row for Banana
        const bananaRow = screen.getByText('Banana').closest('.group');
        const checkbox = bananaRow.querySelector('input[type="checkbox"]');

        fireEvent.click(checkbox);

        const addButton = screen.getByText(/Add Selected/);
        expect(addButton).not.toBeDisabled();

        fireEvent.click(addButton);

        expect(mockOnAdd).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'Banana', count: 1 })
        ]));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('adjusts quantity for food', () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

        const bananaRow = screen.getByText('Banana').closest('.group');
        // Use within to find the add button inside this row
        const plusBtn = within(bananaRow).getAllByText('add')[0].closest('button');

        fireEvent.click(plusBtn);

        // Now it should be selected and count 2
        const addButton = screen.getByText(/Add Selected/);
        fireEvent.click(addButton);

        expect(mockOnAdd).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'Banana', count: 2, calories: 210 }) // 105 * 2
        ]));
    });
});
