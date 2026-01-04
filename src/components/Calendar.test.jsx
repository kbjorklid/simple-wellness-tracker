import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Calendar from './Calendar';

describe('Calendar', () => {
    it('renders correctly', () => {
        render(<Calendar />);
        // React Day Picker renders a table
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });
});
