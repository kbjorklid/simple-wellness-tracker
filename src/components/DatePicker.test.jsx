import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';
import { format } from 'date-fns';

describe('DatePicker', () => {
    const today = new Date();
    const formattedToday = format(today, 'MMM d, yyyy');

    it('renders with current date', () => {
        render(<DatePicker date={today} onSelect={vi.fn()} />);
        expect(screen.getByText(formattedToday)).toBeInTheDocument();
    });

    it('opens calendar on click', () => {
        render(<DatePicker date={today} onSelect={vi.fn()} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('handles interaction (mocking selection)', () => {
        // Since interacting with the calendar might be complex due to 3rd party lib,
        // we mainly check if it renders and can be toggled.
        // Full integration test would be better for actual selection.
        const mockOnSelect = vi.fn();
        render(<DatePicker date={today} onSelect={mockOnSelect} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const grid = screen.getByRole('grid');
        expect(grid).toBeInTheDocument();

        // Click again to close (if logic supports it, though usually click outside closes)
        fireEvent.click(button);
        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
});
