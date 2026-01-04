import { render, screen, fireEvent } from '@testing-library/react';
import ItemMeasurementInputs from './ItemMeasurementInputs';
import { vi } from 'vitest';

describe('ItemMeasurementInputs', () => {
    it('renders calories input only for FOOD type', () => {
        render(<ItemMeasurementInputs type="FOOD" calories={100} minutes={0} onChange={() => { }} />);
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
        expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument();
    });

    it('renders both inputs and link for EXERCISE type', () => {
        render(<ItemMeasurementInputs type="EXERCISE" calories={100} minutes={30} onChange={() => { }} />);
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
        expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
        expect(screen.getByTitle(/link/i)).toBeInTheDocument(); // Checks for button title
    });

    it('updates calories proportionally when linked and minutes change', () => {
        const handleChange = vi.fn();
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Initial state: 300 cal / 30 min = 10 cal/min
        const minutesInput = screen.getByLabelText('Minutes');
        fireEvent.change(minutesInput, { target: { value: '60' } });

        // Should call onChange with new minutes and updated calories (60 * 10 = 600)
        expect(handleChange).toHaveBeenCalledWith({ minutes: 60, calories: 600 });
    });

    it('updates minutes proportionally when linked and calories change', () => {
        const handleChange = vi.fn();
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Initial state: 30 min / 300 cal = 0.1 min/cal
        const caloriesInput = screen.getByLabelText('Calories');
        fireEvent.change(caloriesInput, { target: { value: '600' } });

        // Should call onChange with new calories and updated minutes (600 * 0.1 = 60)
        expect(handleChange).toHaveBeenCalledWith({ calories: 600, minutes: 60 });
    });

    it('does not update proportionally when unlinked', () => {
        const handleChange = vi.fn();
        render(<ItemMeasurementInputs type="EXERCISE" calories={300} minutes={30} onChange={handleChange} />);

        // Unlink
        const linkBtn = screen.getByRole('button'); // Should be the link button
        fireEvent.click(linkBtn);

        const minutesInput = screen.getByLabelText('Minutes');
        fireEvent.change(minutesInput, { target: { value: '60' } });

        // Should ONLY update minutes
        expect(handleChange).toHaveBeenCalledWith({ minutes: 60 });
    });
});
