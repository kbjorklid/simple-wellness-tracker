import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stats from './Stats';

describe('Stats Component', () => {
    it('calculates totals correctly with single items', () => {
        const items = [
            { type: 'FOOD', calories: 500, count: 1 },
            { type: 'EXERCISE', calories: -200, count: 1, minutes: 20 },
        ];
        render(<Stats items={items} goal={2000} rmr={2000} />);

        // Food: 500
        expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('calculates totals correctly with multiple counts', () => {
        const items = [
            { type: 'FOOD', calories: 100, count: 2 }, // 200
            { type: 'FOOD', calories: 50, count: 3 },  // 150 -> Total Food: 350
        ];
        render(<Stats items={items} goal={2000} rmr={2000} />);

        expect(screen.getByText('350')).toBeInTheDocument();
    });

    it('calculates exercise totals with counts', () => {
        // RMR deduction logic is effectively: (totalMinutes / 1440) * rmr
        // If we duplicate exercise items, minutes should also multiply?
        // Logic in Stats.jsx: item.minutes. 
        // We need to decide if count applies to minutes too. 
        // "completed two dog walks" -> implies double the time and double the calories.
        // So yes, minutes should be multiplied by count.

        const items = [
            { type: 'EXERCISE', calories: -100, minutes: 30, count: 2 }, // -200 cal, 60 mins
        ];
        // RMR 2000. 
        // 60 mins / 1440 = 0.041666...
        // 0.041666 * 2000 = 83.33 -> 83
        // Total burned = exerciseDirectBurn (-200) + rmrDeduction (83) = -117

        render(<Stats items={items} goal={2000} rmr={2000} />);

        // We look for 'burned' section.
        // It renders totalBurned.
        expect(screen.getByText('-117')).toBeInTheDocument();
    });

    it('handles missing count property (defaults to 1)', () => {
        const items = [
            { type: 'FOOD', calories: 200 },
        ];
        render(<Stats items={items} goal={2000} rmr={2000} />);
        expect(screen.getByText('200')).toBeInTheDocument();
    });
});
