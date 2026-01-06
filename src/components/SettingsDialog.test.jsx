import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsDialog from './SettingsDialog';
import { db } from '../db';


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
        const settings = {
            weight: 70,
            rmr: 1500,
            deficit: 500
        };

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} settings={settings} />);

        expect(screen.getByText(`Settings for ${currentDate}`)).toBeInTheDocument();
        expect(screen.getByDisplayValue('70')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('saves settings with auto-calculated RMR', async () => {
        // Set system time to fixed date for deterministic age calculation
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-01-01'));

        // Mock DB checks
        const firstMock = vi.fn();
        db.userSettings.where.mockReturnValue({ first: firstMock });
        firstMock.mockResolvedValue(null); // No existing record for EXACT date

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} settings={undefined} />);

        // Use placeholders to be specific for numeric inputs
        // Height, Weight, RMR, Deficit
        fireEvent.change(screen.getByPlaceholderText('e.g. 175'), { target: { value: '180' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 75'), { target: { value: '80' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 1800'), { target: { value: '2000' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 500'), { target: { value: '300' } });

        // Gender and DOB using accessible labels
        fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'male' } });
        fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-01' } });

        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(db.userSettings.add).toHaveBeenCalledWith({
                date: currentDate,
                weight: 80,
                rmr: 1750,
                deficit: 300,
                height: 180,
                gender: 'male',
                dob: '1990-01-01'
            });
            expect(mockOnClose).toHaveBeenCalled();
        });

        vi.useRealTimers();
    });

    it('calls onManageLibrary when button clicked', () => {
        const onManage = vi.fn();
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} onManageLibrary={onManage} />);

        const manageButton = screen.getByText('Manage Item Library');
        fireEvent.click(manageButton);

        expect(onManage).toHaveBeenCalled();
    });
});
