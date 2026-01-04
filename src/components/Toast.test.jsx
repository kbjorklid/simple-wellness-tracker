import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast', () => {
    it('renders message', () => {
        render(<Toast message="Test toast" onClose={vi.fn()} />);
        expect(screen.getByText('Test toast')).toBeInTheDocument();
    });

    it('handles undo', () => {
        const mockUndo = vi.fn();
        render(<Toast message="Deleted" onUndo={mockUndo} onClose={vi.fn()} />);

        const undoBtn = screen.getByText('Undo');
        fireEvent.click(undoBtn);

        expect(mockUndo).toHaveBeenCalled();
    });

    it('does not render undo button if onUndo is missing', () => {
        render(<Toast message="No undo" onClose={vi.fn()} />);
        expect(screen.queryByText('Undo')).toBeNull();
    });

    it('auto-closes after duration', () => {
        vi.useFakeTimers();
        const mockClose = vi.fn();
        render(<Toast message="Timer test" onClose={mockClose} duration={1000} />);

        // Fast forward
        vi.advanceTimersByTime(1000);

        expect(mockClose).toHaveBeenCalled();
        vi.useRealTimers();
    });
});
