import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
    // Helper to get widths of segments
    function getSegmentWidths(container) {
        // The container with overflow-hidden is now inside the relative wrapper
        // It's the div with rounded-full
        const segmentsContainer = container.querySelector('.rounded-full');
        const segments = segmentsContainer.querySelectorAll('div');
        return Array.from(segments).map(div => div.style.width);
    }

    it('calculates value correctly (Under Goal)', () => {
        const items = [
            { type: 'FOOD', calories: 1000, count: 1 },
        ];
        // Goal 2000, RMR 2500. Net 1000.
        // Scale = RMR = 2500.
        // Green = 1000 / 2500 = 40%
        const { container } = render(<ProgressBar items={items} goal={2000} rmr={2500} />);

        // Should see "1,000 kcal" (localized string might vary, but simplified regex or partial match)
        expect(screen.getByText(/1,000/)).toBeInTheDocument();
        expect(screen.getByText('kcal')).toBeInTheDocument();
        expect(screen.getByText('GOAL')).toBeInTheDocument();

        const widths = getSegmentWidths(container);
        expect(widths[0]).toBe('40%'); // Green
        expect(widths[1]).toBe('0%');  // Yellow
        expect(widths[2]).toBe('0%');  // Red
    });

    it('handles between Goal and RMR (Yellow Zone)', () => {
        const items = [
            { type: 'FOOD', calories: 2200, count: 1 },
        ];
        // Goal 2000, RMR 2500. Net 2200.
        // Scale = RMR = 2500.
        // Green: 2000 (filled to goal) / 2500 = 80%
        // Yellow: (2200 - 2000) = 200 / 2500 = 8%
        // Red: 0
        const { container } = render(<ProgressBar items={items} goal={2000} rmr={2500} />);

        expect(screen.getByText(/2,200/)).toBeInTheDocument();

        const widths = getSegmentWidths(container);
        expect(widths[0]).toBe('80%');
        expect(widths[1]).toBe('8%');
        expect(widths[2]).toBe('0%');
    });

    it('handles over RMR (Red Zone)', () => {
        const items = [
            { type: 'FOOD', calories: 3000, count: 1 },
        ];
        // Goal 2000, RMR 2500. Net 3000.
        // Scale = 3000 (Net > RMR).
        // Green: 2000 / 3000 = 66.666...%
        // Yellow: (2500 - 2000) = 500 / 3000 = 16.666...%
        // Red: (3000 - 2500) = 500 / 3000 = 16.666...%

        const { container } = render(<ProgressBar items={items} goal={2000} rmr={2500} />);

        expect(screen.getByText(/3,000/)).toBeInTheDocument();

        const widths = getSegmentWidths(container);
        expect(widths[0]).toContain('66.666');
        expect(widths[1]).toContain('16.666');
        expect(widths[2]).toContain('16.666');
    });

    it('handles negative net calories', () => {
        const items = [
            { type: 'FOOD', calories: 200, count: 1 },
            { type: 'EXERCISE', calories: -300, count: 1 }, // Net -100
        ];
        const { container } = render(<ProgressBar items={items} goal={2000} rmr={2000} />);

        // Should clamp to 0 and show 0 kcal (or -100 if we want to be exact, but logic said just show net)
        // Code renders netCalories.toLocaleString(), so "-100 kcal"
        expect(screen.getByText(/-100/)).toBeInTheDocument();

        const widths = getSegmentWidths(container);
        expect(widths[0]).toBe('0%');
        expect(widths[1]).toBe('0%');
        expect(widths[2]).toBe('0%');
    });
});
