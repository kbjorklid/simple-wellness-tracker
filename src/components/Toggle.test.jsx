import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toggle from './Toggle';

describe('Toggle', () => {
    it('renders label', () => {
        render(<Toggle label="Test Toggle" checked={false} onChange={vi.fn()} />);
        expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    });

    it('handles change', () => {
        const mockChange = vi.fn();
        render(<Toggle label="Test Toggle" checked={false} onChange={mockChange} />);

        const input = screen.getByLabelText('Test Toggle');
        fireEvent.click(input);

        expect(mockChange).toHaveBeenCalled();
    });

    it('reflects checked state', () => {
        render(<Toggle label="Test Toggle" checked={true} onChange={vi.fn()} />);
        const input = screen.getByLabelText('Test Toggle');
        expect(input).toBeChecked();
    });
});
