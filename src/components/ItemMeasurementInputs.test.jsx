import { render, screen, fireEvent } from '@testing-library/react';
import ItemMeasurementInputs from './ItemMeasurementInputs';
import { vi } from 'vitest';

describe('ItemMeasurementInputs', () => {
    it('renders calories input only for FOOD type', () => {
        render(<ItemMeasurementInputs type="FOOD" calories={100} minutes={0} onChange={() => { }} />);
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
        expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument();
    });

    it('renders unlinked by default even for EXERCISE if values are empty/zero', () => {
        // Updated behavior: Requires values to default-link
        render(<ItemMeasurementInputs type="EXERCISE" calories={0} minutes={0} onChange={() => { }} />);
        expect(screen.getByTitle('Link (edit proportionally)')).toBeInTheDocument(); // Means currently UNLINKED
    });

    it('renders linked by default for EXERCISE if values exist', () => {
        render(<ItemMeasurementInputs type="EXERCISE" calories={100} minutes={30} onChange={() => { }} />);
        expect(screen.getByTitle('Unlink (edit separately)')).toBeInTheDocument(); // Means currently LINKED
    });

    it('updates calories proportionally when linked and minutes change', () => {
        const handleChange = vi.fn();
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Initial state: 300 cal / 30 min = 10 cal/min (Automatic link)
        const minutesInput = screen.getByLabelText('Minutes');
        fireEvent.change(minutesInput, { target: { value: '60' } });

        // Should call onChange with new minutes and updated calories (60 * 10 = 600)
        expect(handleChange).toHaveBeenCalledWith({ minutes: 60, calories: 600 });
    });

    it('updates minutes proportionally when linked and calories change', () => {
        const handleChange = vi.fn();
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Initial state: 30 min / 300 cal = 0.1 min/cal (Automatic link)
        const caloriesInput = screen.getByLabelText('Calories');
        fireEvent.change(caloriesInput, { target: { value: '600' } });

        // Should call onChange with new calories and updated minutes (600 * 0.1 = 60)
        expect(handleChange).toHaveBeenCalledWith({ calories: 600, minutes: 60 });
    });

    it('does not update proportionally when unlinked', () => {
        const handleChange = vi.fn();
        // Start linked (300/30)
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Unlink
        const unlinkBtn = screen.getByTitle('Unlink (edit separately)');
        fireEvent.click(unlinkBtn);

        const minutesInput = screen.getByLabelText('Minutes');
        fireEvent.change(minutesInput, { target: { value: '60' } });

        // Should ONLY update minutes
        expect(handleChange).toHaveBeenCalledWith({ minutes: 60 });
    });



    it('maintains stable ratio logic across prop updates', () => {
        const handleChange = vi.fn();
        const { rerender } = render(<ItemMeasurementInputs type="EXERCISE" minutes={10} calories={34} onChange={handleChange} />);

        // 1. Initial Render (10, 34). Linked. Ratio 3.4 captured.

        // 2. Change 10 -> 11.
        const minInput = screen.getByLabelText('Minutes');
        fireEvent.change(minInput, { target: { value: '11' } });

        expect(handleChange).toHaveBeenCalledWith({ minutes: 11, calories: 37 });

        // 3. Update props to reflect what happened (simulating parent)
        rerender(<ItemMeasurementInputs type="EXERCISE" minutes={11} calories={37} onChange={handleChange} />);

        // 4. Change 11 -> 20.
        fireEvent.change(minInput, { target: { value: '20' } });

        // Should use cached 3.4 ratio: 20 * 3.4 = 68
        expect(handleChange).toHaveBeenCalledWith({ minutes: 20, calories: 68 });
    });
});
