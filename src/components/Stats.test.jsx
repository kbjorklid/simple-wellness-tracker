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

    it('shows "Left" and green styling when under goal (State 1)', () => {
        const items = [{ type: 'FOOD', calories: 1500 }]; // 2000 - 1500 = 500 Left
        render(<Stats items={items} goal={2000} rmr={2500} />);

        expect(screen.getByText('Left')).toBeInTheDocument();
        expect(screen.getByText('Left')).toHaveClass('text-emerald-700');
        expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('shows "Over" and yellow styling when over goal but under RMR (State 2)', () => {
        const items = [{ type: 'FOOD', calories: 2200 }]; // Goal 2000. Over by 200. RMR 2500.
        render(<Stats items={items} goal={2000} rmr={2500} />);

        expect(screen.getByText('Over')).toBeInTheDocument();
        expect(screen.getByText('Over')).toHaveClass('text-amber-700');
        expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('shows "Over" and red styling when over RMR (State 3)', () => {
        const items = [{ type: 'FOOD', calories: 2600 }]; // RMR 2500. Over by 600 from goal, 100 from RMR.
        // Logic check:
        // Net = 2600.
        // Calories Left = 2000 - 2600 = -600.
        // isOverGoal = true (-600 < 0).
        // isOverRMR = true (2600 > 2500).
        // Should be RED.

        render(<Stats items={items} goal={2000} rmr={2500} />);

        expect(screen.getByText('Over')).toBeInTheDocument();
        expect(screen.getByText('Over')).toHaveClass('text-red-600');
        expect(screen.getByText('600')).toBeInTheDocument();
    });
});
