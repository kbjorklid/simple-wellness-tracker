import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibraryModal from './LibraryModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../db';

// Mock DB hook to execute the query function
vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: (querier, deps) => {
        const [value, setValue] = React.useState(null);
        React.useEffect(() => {
            Promise.resolve(querier()).then(setValue);
        }, [querier, ...deps]);
        return value;
    }
}));

// Mock DB methods
vi.mock('../db', () => {
    const mockUpdate = vi.fn();
    return {
        db: {
            library: {
                toCollection: vi.fn(),
                update: mockUpdate,
                delete: vi.fn()
            }
        }
    };
});

describe('LibraryModal', () => {
    const mockOnClose = vi.fn();
    const mockOnAdd = vi.fn();

    const mockItems = [
        { id: 1, name: 'Banana', type: 'FOOD', calories: 105, description: 'Medium', lastUsed: 100 },
        { id: 2, name: 'Running', type: 'EXERCISE', calories: 300, minutes: 30, description: 'Moderate', lastUsed: 300 }, // Most recent
        { id: 3, name: 'Apple', type: 'FOOD', calories: 95, lastUsed: 200 },
        { id: 4, name: 'Old Item', type: 'FOOD', calories: 10, lastUsed: 0 } // Least recent
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default db mock behavior
        db.library.toCollection.mockReturnValue({
            toArray: () => Promise.resolve([...mockItems])
        });
        db.library.update.mockResolvedValue(1);
    });

    it('renders and sorts items by lastUsed descending', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

        // specific timeout to allow useLiveQuery effect to run
        await waitFor(() => {
            expect(screen.getByText('Running')).toBeDefined();
        });

        const items = screen.getAllByRole('checkbox').map(cb => {
            return cb.closest('.group').querySelector('.truncate').textContent;
        });

        // Expected order: Running (300), Apple (200), Banana (100), Old Item (0)
        expect(items).toEqual(['Running', 'Apple', 'Banana', 'Old Item']);
    });

    it('updates lastUsed when adding items', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
        await waitFor(() => expect(screen.getByText('Banana')).toBeDefined());

        // Select Banana
        const bananaRow = screen.getByText('Banana').closest('.group');
        const checkbox = bananaRow.querySelector('input[type="checkbox"]');
        fireEvent.click(checkbox);

        // Click Add
        const addButton = screen.getByText(/Add Selected/);
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockOnAdd).toHaveBeenCalled();
        });

        // Check if DB update was called for Banana (id: 1)
        expect(db.library.update).toHaveBeenCalledWith(1, expect.objectContaining({
            lastUsed: expect.any(Number)
        }));
    });

    it('filters by search', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
        await waitFor(() => expect(screen.getByText('Banana')).toBeDefined());

        const input = screen.getByPlaceholderText('Search food or exercise...');
        fireEvent.change(input, { target: { value: 'run' } });

        expect(screen.queryByText('Banana')).toBeNull();
        expect(screen.getByText('Running')).toBeDefined();
    });

    it('allows creating a new item', async () => {
        // Mock add
        const mockAdd = vi.fn().mockResolvedValue(100);
        db.library.add = mockAdd;

        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

        // Open create row
        const newButton = screen.getByText('+ New Item');
        fireEvent.click(newButton);

        // Should see empty inputs
        const nameInput = screen.getByPlaceholderText('Item name');
        fireEvent.change(nameInput, { target: { value: 'New Test Food' } });

        const calorieInput = screen.getByDisplayValue('0'); // Default calories or placeholder
        // Note: LibraryItemRow rendering logic for creating might have specific initial values, 
        // e.g. calories initialized to empty string '' in passed item prop but validation might need number?
        // Let's check LibraryItemRow logic: value={draft.minutes} etc. 
        // In render, item={{..., calories: ''}}. 
        // WellnessInput for number usually shows value.

        // Find inputs by type/placeholder?
        // Let's assume standardized placeholders in ItemMeasurementInputs:
        // "kcal", "min".

        // Finding inputs slightly relying on structure
        const inputs = screen.getAllByRole('spinbutton'); // number inputs
        // 0: calories, 1: minutes (if present/rendered)

        fireEvent.change(inputs[0], { target: { value: '250' } });

        // Save
        const saveButton = screen.getByText('Save Changes'); // or handleSave triggering via Enter? LibraryItemRow has "Save Changes" button in edit mode.
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Test Food',
                calories: 250,
                type: 'FOOD'
            }));
        });
    });

    it('hides create row on cancel', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
        const newButton = screen.getByText('+ New Item');
        fireEvent.click(newButton);

        expect(screen.getByPlaceholderText('Item name')).toBeDefined();

        const cancelButton = screen.getByText('Cancel'); // Needs to distinguish between Footer Cancel and Row Cancel?
        // Row Cancel is inside the edit card. The Footer Cancel is outside.
        // Row Cancel text is "Cancel". Footer is "Cancel".
        // Use verify by context or getAllByText.

        const cancels = screen.getAllByText('Cancel');
        // Usually the first one if creation row is at top?
        // Or specific class match.
        // Let's assume the one near "Save Changes" is the row one.
        const rowCancel = cancels.find(el => el.closest('.border-primary\\/50')); // Edit card has border-primary/50
        // Or more simply, click the first one if DOM order is reliable (Create row is top of list).

        fireEvent.click(cancels[0]);

        await waitFor(() => {
            // Should be back to initial view, name input gone
            expect(screen.queryByPlaceholderText('Item name')).toBeNull();
        });
    });
});
