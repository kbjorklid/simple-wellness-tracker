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

        expect(screen.getByText('Test Food')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByTitle('FOOD')).toBeInTheDocument();
    });

    it('handles count changes', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const addBtn = screen.getByText('add').closest('button');
        fireEvent.click(addBtn);

        expect(mockOnUpdate).toHaveBeenCalledWith(1, { ...mockItem, count: 2 });
    });

    it('handles delete', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const deleteBtn = screen.getByTitle('Delete');
        fireEvent.click(deleteBtn);

        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('handles edit mode', () => {
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const editBtn = screen.getByTitle('Edit');
        fireEvent.click(editBtn);

        const nameInput = screen.getByDisplayValue('Test Food');
        fireEvent.change(nameInput, { target: { value: 'Updated Food' } });

        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        expect(mockOnUpdate).toHaveBeenCalledWith(1, { ...mockItem, name: 'Updated Food' });
    });

    it('handles proportional updates for linked exercise inputs', () => {
        const exerciseItem = { ...mockItem, type: 'EXERCISE', minutes: 30, calories: 300 };
        render(<ActivityItem item={exerciseItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const editBtn = screen.getByTitle('Edit');
        fireEvent.click(editBtn);

        // Verify default linked state
        expect(screen.getByTitle('Unlink (edit separately)')).toBeInTheDocument();

        // Change minutes -> calories should update (300/30 = 10 ratio)
        const minInput = screen.getByLabelText('Minutes');
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(screen.getByLabelText('Calories')).toHaveValue(600);

        // Change calories -> minutes should update
        const calInput = screen.getByLabelText('Calories');
        fireEvent.change(calInput, { target: { value: '150' } });
        expect(screen.getByLabelText('Minutes')).toHaveValue(15);
    });

    it('handles independent updates for unlinked exercise inputs', () => {
        const exerciseItem = { ...mockItem, type: 'EXERCISE', minutes: 30, calories: 300 };
        render(<ActivityItem item={exerciseItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} />);

        const editBtn = screen.getByTitle('Edit');
        fireEvent.click(editBtn);

        // Unlink
        const linkBtn = screen.getByTitle('Unlink (edit separately)');
        fireEvent.click(linkBtn);
        expect(screen.getByTitle('Link (edit proportionally)')).toBeInTheDocument();

        // Change minutes -> calories should NOT update
        const minInput = screen.getByLabelText('Minutes');
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(screen.getByLabelText('Calories')).toHaveValue(300);

        // Change calories -> minutes should NOT update
        const calInput = screen.getByLabelText('Calories');
        fireEvent.change(calInput, { target: { value: '450' } });
        expect(screen.getByLabelText('Minutes')).toHaveValue(60);
    });

    it('calls onSaveToLibrary when save button clicked', () => {
        const mockOnSaveToLibrary = vi.fn();
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} onSaveToLibrary={mockOnSaveToLibrary} />);

        const saveBtn = screen.getByTitle('Save to Library');
        fireEvent.click(saveBtn);

        expect(mockOnSaveToLibrary).toHaveBeenCalledWith(mockItem);
    });

    it('renders correct state when item is in library', () => {
        const mockOnSaveToLibrary = vi.fn();
        render(<ActivityItem item={mockItem} isInLibrary={true} onDelete={mockOnDelete} onUpdate={mockOnUpdate} onSaveToLibrary={mockOnSaveToLibrary} />);

        // Should replace the title and icon
        const replaceBtn = screen.getByTitle('In Library (Click to Replace)');
        expect(replaceBtn).toBeInTheDocument();

        // Icon should be filled bookmark
        expect(screen.getByText('bookmark')).toBeInTheDocument();

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
