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
        const items = await screen.findAllByText('Oatmeal & Berries');
        expect(items[0]).toBeInTheDocument();
        expect(screen.getByText('Goal')).toBeInTheDocument();
        expect(screen.getByText('2000')).toBeInTheDocument();
    });

    it('adds a food item', async () => {
        render(<App />);

        // Wait to load
        await screen.findAllByText('Oatmeal & Berries');

        const nameInput = screen.getByPlaceholderText('Quick add item...');
        const calInput = screen.getByLabelText('Calories');

        fireEvent.change(nameInput, { target: { value: 'New Food' } });
        fireEvent.change(calInput, { target: { value: '100' } });

        // Find toggle button
        const toggleBtn = screen.getByTitle(/Current type:/);

        expect(toggleBtn).toBeInTheDocument();

        // Add
        const checkBtn = screen.getByText('check').closest('button');

        expect(checkBtn).not.toBeDisabled();
        fireEvent.click(checkBtn);

        const newItems = await screen.findAllByText('New Food');
        expect(newItems[0]).toBeInTheDocument();
    });

    it('adds an exercise item (negative calories)', async () => {
        render(<App />);

        await screen.findAllByText('Oatmeal & Berries');

        const nameInput = screen.getByPlaceholderText('Quick add item...');

        fireEvent.change(nameInput, { target: { value: 'Running' } });

        const toggleBtn = screen.getByTitle(/Current type:/);
        fireEvent.click(toggleBtn);

        expect(toggleBtn).toHaveAttribute('title', expect.stringContaining('EXERCISE'));

        // Re-query because inputs might have been replaced
        const caloriesInput = screen.getByLabelText('Calories');
        fireEvent.change(caloriesInput, { target: { value: '300' } });

        const checkBtn = screen.getByText('check').closest('button');

        expect(checkBtn).not.toBeDisabled();
        fireEvent.click(checkBtn);

        const runningItems = await screen.findAllByText('Running');
        expect(runningItems[0]).toBeInTheDocument();
        const negCals = screen.getAllByText('-300');
        expect(negCals.length).toBeGreaterThan(0);
    });

    it('deletes an item', async () => {
        render(<App />);
        const items = await screen.findAllByText('Oatmeal & Berries');
        const item = items[0];
        expect(item).toBeInTheDocument();

        const row = item.closest('.group');
        const closeBtns = within(row).getAllByText('delete');
        const closeBtn = closeBtns[0].closest('button');
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

        const items = await screen.findAllByText('Oatmeal & Berries');
        const item = items[0];
        // Find the + button in the row
        const row = item.closest('.group');
        const addBtns = within(row).getAllByText('add');
        const addBtn = addBtns[0];

        fireEvent.click(addBtn); // Count becomes 2

        // Oatmeal is 350. Extra 350 added. Total should be startTotal + 350.
        const totalItems = await screen.findAllByText((startTotal + 350).toString());
        expect(totalItems.length).toBeGreaterThan(0);

        const removeBtns = within(row).getAllByText('remove');
        fireEvent.click(removeBtns[0]); // Back to 1

        expect(await screen.findByText(startTotal.toString())).toBeInTheDocument();
    });
    it('toggles day complete status', async () => {
        render(<App />);
        await screen.findAllByText('Oatmeal & Berries');

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
    it('saves item to library with lastUsed timestamp', async () => {
        render(<App />);
        const items = await screen.findAllByText('Oatmeal & Berries');
        const item = items[0];
        const row = item.closest('.group');

        // Find bookmark button
        const bookmarkBtns = within(row).getAllByTitle('Save to Library');
        fireEvent.click(bookmarkBtns[0]);

        // Wait for toast
        await screen.findByText('Saved to library');

        // Check DB
        const libraryItems = await db.library.toArray();
        const savedItem = libraryItems.find(i => i.name === 'Oatmeal & Berries');

        expect(savedItem).toBeDefined();
        expect(savedItem.lastUsed).toBeDefined();
        expect(typeof savedItem.lastUsed).toBe('number');
        // Ensure it's recent (within last minute)
        expect(Date.now() - savedItem.lastUsed).toBeLessThan(60000);
    });

    it('updates weight settings for the day', async () => {
        render(<App />);
        await screen.findByText('2000'); // Validates load

        // Find weight display (starts as -- if no settings, or uses previous if any. DB cleared in beforeEach, so -- or userSettings default?)
        // In beforeEach, we only add items. userSettings is empty.
        // So it should show '--'.

        // Wait for it to be visible
        const weightBtn = await screen.findByTitle('Click to edit weight');
        expect(weightBtn).toBeInTheDocument();

        fireEvent.click(weightBtn);

        const input = screen.getByPlaceholderText('Weight');
        fireEvent.change(input, { target: { value: '70' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // Should show 70
        const weightItems = await screen.findAllByText('70');
        expect(weightItems[0]).toBeInTheDocument();

        // Check DB
        const setting = await db.userSettings.where({ date: today }).first();
        expect(setting).toBeDefined();
        expect(setting.weight).toBe(70);
    });
});
