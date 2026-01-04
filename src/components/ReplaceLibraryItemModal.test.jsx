import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReplaceLibraryItemModal from './ReplaceLibraryItemModal';
import { describe, it, expect, vi } from 'vitest';

describe('ReplaceLibraryItemModal', () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    const existingItem = {
        id: 1,
        name: 'Apple',
        calories: 95,
        type: 'FOOD',
        description: 'Small'
    };

    it('renders nothing when not open', () => {
        render(<ReplaceLibraryItemModal isOpen={false} />);
        expect(screen.queryByText('Replace Library Item?')).toBeNull();
    });

    it('renders changes correctly', () => {
        const newItem = { ...existingItem, calories: 105, description: 'Medium' };

        render(
            <ReplaceLibraryItemModal
                isOpen={true}
                existingItem={existingItem}
                newItem={newItem}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByText('Replace Library Item?')).toBeDefined();

        // Check for calories change display
        expect(screen.getByText('Calories')).toBeDefined();
        expect(screen.getByText('95')).toBeDefined(); // Old
        expect(screen.getByText('105')).toBeDefined(); // New

        // Check for description change display
        expect(screen.getByText('Description')).toBeDefined();
        expect(screen.getByText('Small')).toBeDefined();
        expect(screen.getByText('Medium')).toBeDefined();
    });

    it('does not show unchanged fields', () => {
        const newItem = { ...existingItem, calories: 105 }; // Only calories changed

        render(
            <ReplaceLibraryItemModal
                isOpen={true}
                existingItem={existingItem}
                newItem={newItem}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.queryByText('Name')).toBeNull();
        expect(screen.queryByText('Minutes')).toBeNull();
        expect(screen.getByText('Calories')).toBeDefined();
    });

    it('confirms replacement', () => {
        const newItem = { ...existingItem, calories: 105 };

        render(
            <ReplaceLibraryItemModal
                isOpen={true}
                existingItem={existingItem}
                newItem={newItem}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        fireEvent.click(screen.getByText('Replace Item'));
        expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('cancels replacement', () => {
        const newItem = { ...existingItem, calories: 105 };

        render(
            <ReplaceLibraryItemModal
                isOpen={true}
                existingItem={existingItem}
                newItem={newItem}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
