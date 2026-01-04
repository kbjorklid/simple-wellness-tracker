import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeightDisplay from './WeightDisplay';

describe('WeightDisplay', () => {
    it('renders weight and unit', () => {
        render(<WeightDisplay weight={75} unit="kg" onSave={() => { }} />);
        expect(screen.getByText('75')).toBeInTheDocument();
        expect(screen.getByText('kg')).toBeInTheDocument();
    });

    it('renders placeholder when weight is missing', () => {
        render(<WeightDisplay weight={null} onSave={() => { }} />);
        expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('enters edit mode on click', () => {
        render(<WeightDisplay weight={75} onSave={() => { }} />);
        const button = screen.getByTitle('Click to edit weight');
        fireEvent.click(button);

        expect(screen.getByPlaceholderText('Weight')).toBeInTheDocument();
        expect(screen.getByDisplayValue('75')).toBeInTheDocument();
    });

    it('saves on enter', () => {
        const handleSave = vi.fn();
        render(<WeightDisplay weight={75} onSave={handleSave} />);

        fireEvent.click(screen.getByTitle('Click to edit weight'));
        const input = screen.getByPlaceholderText('Weight');

        fireEvent.change(input, { target: { value: '80' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(handleSave).toHaveBeenCalledWith(80);
    });

    it('saves on blur', () => {
        const handleSave = vi.fn();
        render(<WeightDisplay weight={75} onSave={handleSave} />);

        fireEvent.click(screen.getByTitle('Click to edit weight'));
        const input = screen.getByPlaceholderText('Weight');

        fireEvent.change(input, { target: { value: '82.5' } });
        fireEvent.blur(input);

        expect(handleSave).toHaveBeenCalledWith(82.5);
    });

    it('cancels on escape', () => {
        const handleSave = vi.fn();
        render(<WeightDisplay weight={75} onSave={handleSave} />);

        fireEvent.click(screen.getByTitle('Click to edit weight'));
        const input = screen.getByPlaceholderText('Weight');

        fireEvent.change(input, { target: { value: '100' } });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

        // Should exit edit mode and NOT save
        // Wait, my implementation calls handleSave on blur, and setIsEditing(false) removes input which triggers blur?
        // React's event handling might trigger blur if component unmounts? No, unmounting doesn't allow blur event to propagate usually?
        // Let's check implementation behavior. 
        // If Escape -> setIsEditing(false). Input is removed.
        // Does onBlur fire?
        // Testing-library might behave specifically.
        // In real browser, if element is removed, blur might not fire or handlers might be detached.

        expect(handleSave).not.toHaveBeenCalled();
        expect(screen.getByText('75')).toBeInTheDocument();
    });
});
