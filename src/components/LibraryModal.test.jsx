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
                delete: vi.fn(),
                add: vi.fn()
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
        db.library.add.mockResolvedValue(100);
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
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} mode="manage" />);

        // Open create row
        const newButton = screen.getByText('+ New Item');
        fireEvent.click(newButton);

        // Should see empty inputs
        const nameInput = screen.getByPlaceholderText('Item name');
        fireEvent.change(nameInput, { target: { value: 'New Test Food' } });

        // Find inputs by placeholder is safer, or rely on being the first spinbutton (which should be correct)
        const inputs = screen.getAllByRole('spinbutton');
        // The first one should be the calorie input of the new row at the top
        fireEvent.change(inputs[0], { target: { value: '250' } });

        // Save
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(db.library.add).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Test Food',
                calories: 250,
                type: 'FOOD'
            }));
        });
    });

    it('hides create row on cancel', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} mode="manage" />);
        const newButton = screen.getByText('+ New Item');
        fireEvent.click(newButton);

        expect(screen.getByPlaceholderText('Item name')).toBeDefined();

        const cancels = screen.getAllByText('Cancel');
        // Click the first cancel button (which should be the one in the creating row)
        fireEvent.click(cancels[0]);

        await waitFor(() => {
            // Should be back to initial view, name input gone
            expect(screen.queryByPlaceholderText('Item name')).toBeNull();
        });
    });

    it('renders correct title and hides actions in select mode', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} mode="select" />);
        expect(screen.getByText('Add from Library')).toBeDefined();
        expect(screen.queryByText('+ New Item')).toBeNull();

        await waitFor(() => expect(screen.getByText('Banana')).toBeDefined());

        // Check actions (Edit/Delete) are hidden
        const startState = screen.getByText('Banana').closest('.group');
        expect(startState.querySelector('button[title="Edit"]')).toBeNull();
    });

    it('renders correct title and shows actions in manage mode', async () => {
        render(<LibraryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} mode="manage" />);
        expect(screen.getByText('Manage Library')).toBeDefined();
        expect(screen.getByText('+ New Item')).toBeDefined();

        await waitFor(() => expect(screen.getByText('Banana')).toBeDefined());

        // Check actions exist
        const startState = screen.getByText('Banana').closest('.group');
        expect(startState.querySelector('button[title="Edit"]')).toBeDefined();

        // Check checkboxes are hidden
        expect(screen.queryByRole('checkbox')).toBeNull();

        // Check footer (Add Selected) is hidden
        expect(screen.queryByText('Add Selected')).toBeNull();
    });
});
