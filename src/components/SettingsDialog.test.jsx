import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsDialog from './SettingsDialog';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

// Mock DB and Dexie hooks
vi.mock('../db', () => ({
    db: {
        userSettings: {
            where: vi.fn(),
            add: vi.fn(),
            update: vi.fn()
        }
    }
}));

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn()
}));

describe('SettingsDialog', () => {
    const mockOnClose = vi.fn();
    const currentDate = '2023-01-01';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when closed', () => {
        render(<SettingsDialog isOpen={false} onClose={mockOnClose} currentDate={currentDate} />);
        expect(screen.queryByText(/Settings for/)).not.toBeInTheDocument();
    });

    it('renders inputs when open', () => {
        // Mock return of useLiveQuery
        useLiveQuery.mockReturnValue({
            weight: 70,
            rmr: 1500,
            deficit: 500
        });

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} />);

        expect(screen.getByText(`Settings for ${currentDate}`)).toBeInTheDocument();
        expect(screen.getByDisplayValue('70')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('saves settings', async () => {
        // Mock empty initial settings so inputs are empty or controlled by state default
        useLiveQuery.mockReturnValue(undefined);

        // Mock DB checks
        const firstMock = vi.fn();
        db.userSettings.where.mockReturnValue({ first: firstMock });
        firstMock.mockResolvedValue(null); // No existing record for EXACT date

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} />);

        const inputs = screen.getAllByRole('spinbutton');
        // weight, rmr, deficit
        fireEvent.change(inputs[0], { target: { value: '80' } });
        fireEvent.change(inputs[1], { target: { value: '2000' } });
        fireEvent.change(inputs[2], { target: { value: '300' } });

        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(db.userSettings.add).toHaveBeenCalledWith({
                date: currentDate,
                weight: 80,
                rmr: 2000,
                deficit: 300
            });
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
