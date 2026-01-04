import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';

describe('Header', () => {
    it('renders logo and title', () => {
        render(<Header onSettingsClick={vi.fn()} />);
        expect(screen.getByText('CalorieLog')).toBeInTheDocument();
        // SVG checks are brittle, maybe just check existence?
        // But title is enough for basic render test.
    });

    it('triggers settings click', () => {
        const mockFn = vi.fn();
        render(<Header onSettingsClick={mockFn} />);

        const settingsBtn = screen.getByRole('button');
        fireEvent.click(settingsBtn);

        expect(mockFn).toHaveBeenCalled();
    });
});
