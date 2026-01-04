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
        const minInput = screen.getByPlaceholderText('min');
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(screen.getByPlaceholderText('cal')).toHaveValue(600);

        // Change calories -> minutes should update
        const calInput = screen.getByPlaceholderText('cal');
        fireEvent.change(calInput, { target: { value: '150' } });
        expect(screen.getByPlaceholderText('min')).toHaveValue(15);
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
        const minInput = screen.getByPlaceholderText('min');
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(screen.getByPlaceholderText('cal')).toHaveValue(300);

        // Change calories -> minutes should NOT update
        const calInput = screen.getByPlaceholderText('cal');
        fireEvent.change(calInput, { target: { value: '450' } });
        expect(screen.getByPlaceholderText('min')).toHaveValue(60);
    });

    it('calls onSaveToLibrary when save button clicked', () => {
        const mockOnSaveToLibrary = vi.fn();
        render(<ActivityItem item={mockItem} onDelete={mockOnDelete} onUpdate={mockOnUpdate} onSaveToLibrary={mockOnSaveToLibrary} />);

        const saveBtn = screen.getByTitle('Save to Library');
        fireEvent.click(saveBtn);

        expect(mockOnSaveToLibrary).toHaveBeenCalledWith(mockItem);
    });
});
