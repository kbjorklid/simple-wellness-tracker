import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickAdd from './QuickAdd';

describe('QuickAdd', () => {
    it('renders input fields', () => {
        render(<QuickAdd onAdd={vi.fn()} />);

        expect(screen.getByPlaceholderText('Quick add item...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
        expect(screen.getByTitle('Current type: FOOD. Click to toggle.')).toBeInTheDocument();
    });

    it('toggles type between FOOD and EXERCISE', () => {
        render(<QuickAdd onAdd={vi.fn()} />);

        const typeBtn = screen.getByTitle('Current type: FOOD. Click to toggle.');
        fireEvent.click(typeBtn);

        expect(screen.getByTitle('Current type: EXERCISE. Click to toggle.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('min')).toBeInTheDocument();
    });

    it('submits valid data', () => {
        const mockAdd = vi.fn();
        render(<QuickAdd onAdd={mockAdd} />);

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByPlaceholderText('0');
        const addBtn = screen.getByText('check').closest('button');

        fireEvent.change(nameInput, { target: { value: 'Apple' } });
        fireEvent.change(calInput, { target: { value: '95' } });

        fireEvent.click(addBtn);

        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Apple',
            calories: 95,
            type: 'FOOD'
        }));

        // Should clear inputs
        expect(nameInput.value).toBe('');
    });

    it('handles negative calories for exercise automatically', () => {
        const mockAdd = vi.fn();
        render(<QuickAdd onAdd={mockAdd} />);

        // Switch to exercise
        fireEvent.click(screen.getByTitle('Current type: FOOD. Click to toggle.'));

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByPlaceholderText('0');
        const minInput = screen.getByPlaceholderText('min');
        const addBtn = screen.getByText('check').closest('button');

        fireEvent.change(nameInput, { target: { value: 'Run' } });
        fireEvent.change(calInput, { target: { value: '300' } });
        fireEvent.change(minInput, { target: { value: '30' } });

        fireEvent.click(addBtn);

        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Run',
            calories: -300,
            type: 'EXERCISE',
            minutes: 30
        }));
    });

    it('handles independent updates for unlinked exercise inputs (default)', () => {
        render(<QuickAdd onAdd={vi.fn()} />);
        fireEvent.click(screen.getByTitle('Current type: FOOD. Click to toggle.')); // Switch to EXERCISE

        // Verify default unlinked state
        expect(screen.getByTitle('Link (edit proportionally)')).toBeInTheDocument();

        const minInput = screen.getByPlaceholderText('min');
        const calInput = screen.getByPlaceholderText('0');

        // Set initial values
        fireEvent.change(minInput, { target: { value: '30' } });
        fireEvent.change(calInput, { target: { value: '300' } });

        // Update minutes -> calories should NOT change
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(calInput).toHaveValue(300);

        // Update calories -> minutes should NOT change
        fireEvent.change(calInput, { target: { value: '600' } });
        expect(minInput).toHaveValue(60);
    });

    it('handles proportional updates for linked exercise inputs', () => {
        render(<QuickAdd onAdd={vi.fn()} />);
        fireEvent.click(screen.getByTitle('Current type: FOOD. Click to toggle.')); // Switch to EXERCISE

        const minInput = screen.getByPlaceholderText('min');
        const calInput = screen.getByPlaceholderText('0');

        // Set initial values while unlinked to establish ratio
        fireEvent.change(minInput, { target: { value: '30' } });
        fireEvent.change(calInput, { target: { value: '300' } });

        // Link
        const linkBtn = screen.getByTitle('Link (edit proportionally)');
        fireEvent.click(linkBtn);
        expect(screen.getByTitle('Unlink (edit separately)')).toBeInTheDocument();

        // Change minutes -> calories should update (300/30 = 10 ratio)
        fireEvent.change(minInput, { target: { value: '60' } });
        expect(calInput).toHaveValue(600);

        // Change calories -> minutes should update
        fireEvent.change(calInput, { target: { value: '150' } });
        expect(minInput).toHaveValue(15);
    });
});
