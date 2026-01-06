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
        expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
        // Check default value
        expect(screen.getByLabelText('Minutes')).toHaveValue(30);
    });

    it('submits valid data', () => {
        const mockAdd = vi.fn();
        render(<QuickAdd onAdd={mockAdd} />);

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByLabelText('Calories');
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
        const calInput = screen.getByLabelText('Calories');
        const minInput = screen.getByLabelText('Minutes');
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

        const minInput = screen.getByLabelText('Minutes');
        const calInput = screen.getByLabelText('Calories');

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

        const minInput = screen.getByLabelText('Minutes');
        const calInput = screen.getByLabelText('Calories');

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

    it('disables save button when invalid', () => {
        render(<QuickAdd onAdd={vi.fn()} />);
        const addBtn = screen.getByText('check').closest('button');

        expect(addBtn).toBeDisabled();

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        fireEvent.change(nameInput, { target: { value: 'Apple' } });
        expect(addBtn).toBeDisabled(); // still disabled, no calories

        const calInput = screen.getByLabelText('Calories');
        fireEvent.change(calInput, { target: { value: '100' } });
        expect(addBtn).not.toBeDisabled();
    });

    it('resets inputs on cancel', () => {
        render(<QuickAdd onAdd={vi.fn()} />);

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        fireEvent.change(nameInput, { target: { value: 'Apple' } });

        const cancelBtn = screen.getByTitle('Cancel');
        fireEvent.click(cancelBtn);

        expect(nameInput.value).toBe('');
        // Cancel button should disappear when empty
        expect(screen.queryByTitle('Cancel')).not.toBeInTheDocument();
    });
    it('maintains stable ratio to prevent rounding errors', () => {
        render(<QuickAdd onAdd={vi.fn()} />);
        fireEvent.click(screen.getByTitle('Current type: FOOD. Click to toggle.')); // Switch to EXERCISE

        const minInput = screen.getByLabelText('Minutes');
        const calInput = screen.getByLabelText('Calories');

        // Initial: 10 mins, 34 cals (Ratio 3.4)
        fireEvent.change(minInput, { target: { value: '10' } });
        fireEvent.change(calInput, { target: { value: '34' } });

        // Link
        fireEvent.click(screen.getByTitle('Link (edit proportionally)'));

        // Change to 11 mins -> 37.4 -> 37 cals
        fireEvent.change(minInput, { target: { value: '11' } });
        expect(calInput).toHaveValue(37);

        // Jump to 20 mins
        // If unstable (derived from 37/11=3.36): 20 * 3.36 = 67.2 -> 67
        // If stable (3.4): 20 * 3.4 = 68
        fireEvent.change(minInput, { target: { value: '20' } });
        expect(calInput).toHaveValue(68);
    });
});

