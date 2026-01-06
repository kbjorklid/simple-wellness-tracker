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
        // We assume "today" is 2026 (system time).
        // DOB: 1990-01-01. Age = 36.
        // BMR (Mifflin, Male, 80kg, 180cm, 36y):
        // 10*80 + 6.25*180 - 5*36 + 5
        // 800 + 1125 - 180 + 5 = 1750.
        // TDEE (Sedentary 1.2) = 1750 * 1.2 = 2100.

        // Mock DB checks
        const firstMock = vi.fn();
        db.userSettings.where.mockReturnValue({ first: firstMock });
        firstMock.mockResolvedValue(null); // No existing record for EXACT date

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} settings={undefined} />);

        // Use placeholders to be specific for numeric inputs
        // Height, Weight, RMR, Deficit
        fireEvent.change(screen.getByPlaceholderText('e.g. 175'), { target: { value: '180' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 75'), { target: { value: '80' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 2000'), { target: { value: '2000' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 500'), { target: { value: '300' } });

        // Gender and DOB using accessible labels
        fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'male' } });
        fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-01' } });
        fireEvent.change(screen.getByLabelText('Activity Level'), { target: { value: 'sedentary' } });

        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(db.userSettings.add).toHaveBeenCalledWith({
                date: currentDate,
                weight: 80,
                rmr: 2100, // TDEE (Age 36)
                deficit: 300,
                height: 180,
                gender: 'male',
                dob: '1990-01-01',
                activityLevel: 'sedentary'
            });
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('calls onManageLibrary when button clicked', () => {
        const onManage = vi.fn();
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} currentDate={currentDate} onManageLibrary={onManage} />);

        const manageButton = screen.getByText('Manage Item Library');
        fireEvent.click(manageButton);

        expect(onManage).toHaveBeenCalled();
    });
});
