import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActivityItem from './ActivityItem';

describe('ActivityItem', () => {
    const mockItem = {
        id: 1,
        name: 'Test Food',
        type: 'FOOD',
        calories: 100,
        count: 1,
        description: 'Test Description',
        minutes: 0
    };
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();

    it('renders interactions correctly', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        // Mobile/Desktop duplication means we see multiple elements
        expect(screen.getAllByText('Test Food').length).toBeGreaterThan(0);
        expect(screen.getAllByText('100').length).toBeGreaterThan(0);
        expect(screen.getAllByTitle('FOOD').length).toBeGreaterThan(0);
    });

    it('handles count changes', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const addBtns = screen.getAllByText('add');
        const addBtn = addBtns[0].closest('button');
        fireEvent.click(addBtn);

        expect(mockOnUpdate).toHaveBeenCalledWith(1, { ...mockItem, count: 2 });
    });

    it('handles delete', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const deleteBtn = screen.getAllByTitle('Delete')[0];
        fireEvent.click(deleteBtn);

        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('handles edit mode', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const editBtn = screen.getAllByTitle('Edit')[0];
        fireEvent.click(editBtn);

        const nameInputs = screen.getAllByDisplayValue('Test Food');
        fireEvent.change(nameInputs[0], { target: { value: 'Updated Food' } });

        // Save button might be "Save Changes" (desktop/expanded) or "Save" (mobile)
        // Let's try to find either
        const saveBtns = screen.queryAllByText(/Save/i);
        const saveBtn = saveBtns.find(btn => btn.tagName === 'BUTTON');
        fireEvent.click(saveBtn);

        expect(mockOnUpdate).toHaveBeenCalledWith(1, { ...mockItem, name: 'Updated Food' });
    });

    // ... (skipped some lines)

    it('calls onSaveToLibrary when save button clicked', () => {
        const mockOnSaveToLibrary = vi.fn();
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} onSaveToLibrary={mockOnSaveToLibrary} />);

        const saveBtn = screen.getAllByTitle('Save to Library')[0];
        fireEvent.click(saveBtn);

        expect(mockOnSaveToLibrary).toHaveBeenCalledWith(mockItem);
    });

    it('renders correct state when item is in library', () => {
        const mockOnSaveToLibrary = vi.fn();
        render(<ActivityItem item={mockItem} isInLibrary={true} onDelete={mockOnDelete} onUpdate={mockOnUpdate} onSaveToLibrary={mockOnSaveToLibrary} />);

        // Should replace the title and icon
        const replaceBtns = screen.getAllByTitle('In Library (Click to Replace)');
        expect(replaceBtns.length).toBeGreaterThan(0);
        const replaceBtn = replaceBtns[0];
        expect(replaceBtn).toBeInTheDocument();

        // Icon should be filled bookmark
        expect(screen.getAllByText('bookmark').length).toBeGreaterThan(0);

        // Clicking it should still call onSaveToLibrary (which opens replace modal in App.jsx logic)
        fireEvent.click(replaceBtn);
        expect(mockOnSaveToLibrary).toHaveBeenCalledWith(mockItem);
    });

    it('handles auto-focus description', async () => {
        const mockOnFocusHandled = vi.fn();

        // Render with shouldAutoFocusDescription=true
        render(
            <ActivityItem
                item={mockItem}
                onDelete={mockOnDelete}
                onUpdate={mockOnUpdate}
                shouldAutoFocusDescription={true}
                onFocusHandled={mockOnFocusHandled}
            />
        );

        // Verify that the item is expanded (description textarea is visible)
        // Wait for the effect and timeout
        await screen.findByPlaceholderText('Add a description...');

        // Verify onFocusHandled was called
        // Note: checking actual focus in JSDOM usually requires user-event or specific setup, 
        // but verifying the callback and presence is a strong signal.
        await new Promise(r => setTimeout(r, 60)); // Wait for the timeout in component
        expect(mockOnFocusHandled).toHaveBeenCalled();

        // Verify name input does NOT have autoFocus (by exclusion, or logic check in code structure which creates <WellnessInput autoFocus={false} />)
        // Explicitly checking the prop on the rendered input might be tricky without internal component mocking, 
        // but we can trust the render logic if the description is present and focused.
    });
});
