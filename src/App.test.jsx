import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { db } from './db';

const today = new Date().toISOString().split('T')[0];

const initialItems = [
    { name: 'Oatmeal & Berries', type: 'FOOD', calories: 350, description: '', date: today },
    { name: 'Morning Jog', type: 'EXERCISE', calories: -250, description: '', date: today },
    { name: 'Grilled Chicken Salad', type: 'FOOD', calories: 450, description: 'Grilled chicken breast', date: today },
];

describe('App', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.items.bulkAdd(initialItems);
    });

    it('renders initial items and stats', async () => {
        render(<App />);
        expect(await screen.findByText('Oatmeal & Berries')).toBeInTheDocument();
        expect(screen.getByText('Goal')).toBeInTheDocument();
        expect(screen.getByText('2000')).toBeInTheDocument();
    });

    it('adds a food item', async () => {
        render(<App />);

        // Wait to load
        await screen.findByText('Oatmeal & Berries');

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByPlaceholderText('0');

        fireEvent.change(nameInput, { target: { value: 'New Food' } });
        fireEvent.change(calInput, { target: { value: '100' } });

        const allFoodButtons = screen.getAllByText('FOOD');
        const foodButtons = allFoodButtons.filter(el => el.tagName === 'BUTTON');
        const toggleBtn = foodButtons[foodButtons.length - 1];

        expect(toggleBtn).toBeInTheDocument();

        // Add
        const checkBtns = screen.getAllByText('check');
        const checkBtn = checkBtns[checkBtns.length - 1].closest('button');

        fireEvent.click(checkBtn);

        expect(await screen.findByText('New Food')).toBeInTheDocument();
    });

    it('adds an exercise item (negative calories)', async () => {
        render(<App />);

        await screen.findByText('Oatmeal & Berries');

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByPlaceholderText('0');

        fireEvent.change(nameInput, { target: { value: 'Running' } });

        const allFoodButtons = screen.getAllByText('FOOD');
        const foodBtns = allFoodButtons.filter(el => el.tagName === 'BUTTON');
        const toggleBtn = foodBtns[foodBtns.length - 1];

        fireEvent.click(toggleBtn);

        expect(toggleBtn).toHaveTextContent('EXERCISE');

        fireEvent.change(calInput, { target: { value: '300' } });

        const checkBtns = screen.getAllByText('check');
        const checkBtn = checkBtns[checkBtns.length - 1].closest('button');
        fireEvent.click(checkBtn);

        expect(await screen.findByText('Running')).toBeInTheDocument();
        const negCals = screen.getAllByText('-300');
        expect(negCals.length).toBeGreaterThan(0);
    });

    it('deletes an item', async () => {
        render(<App />);
        const item = await screen.findByText('Oatmeal & Berries');
        expect(item).toBeInTheDocument();

        const row = item.closest('.group').querySelector('.grid');
        const closeBtn = within(row).getByText('delete').closest('button');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(screen.queryByText('Oatmeal & Berries')).not.toBeInTheDocument();
        });
    });

    it('updates item count and totals', async () => {
        render(<App />);
        const startTotal = 350 + 450; // oatmeal + chicken (exercise is neg but not in "Food" total)
        // Check initial Food total
        await screen.findByText(startTotal.toString());

        const item = await screen.findByText('Oatmeal & Berries');
        // Find the + button in the row
        const row = item.closest('.group');
        const addBtn = within(row).getByText('add');

        fireEvent.click(addBtn); // Count becomes 2

        // Oatmeal is 350. Extra 350 added. Total should be startTotal + 350.
        expect(await screen.findByText((startTotal + 350).toString())).toBeInTheDocument();

        const removeBtn = within(row).getByText('remove');
        fireEvent.click(removeBtn); // Back to 1

        expect(await screen.findByText(startTotal.toString())).toBeInTheDocument();
    });
    it('toggles day complete status', async () => {
        render(<App />);
        await screen.findByText('Oatmeal & Berries');

        // Initial state: not checked
        const toggle = screen.getByLabelText('Day Complete');
        expect(toggle).not.toBeChecked();

        // Toggle ON
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(toggle).toBeChecked();
        });

        // Check DB
        const day = await db.days.get(today);
        expect(day).toEqual({ date: today, isComplete: true });

        // Toggle OFF
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(toggle).not.toBeChecked();
        });

        // Check DB
        const dayAfter = await db.days.get(today);
        expect(dayAfter.isComplete).toBe(false);
    });
});
