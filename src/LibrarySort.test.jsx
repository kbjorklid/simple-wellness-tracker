import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import { db } from './db';

// Mock scrollTo
Element.prototype.scrollTo = () => { };

// Use fake timers for deterministic lastUsed timestamps
// But usageCount is the primary sorter now.

const initialLibraryItems = [
    { name: 'Apple', type: 'FOOD', calories: 50, usageCount: 0, lastUsed: 1000 },
    { name: 'Banana', type: 'FOOD', calories: 100, usageCount: 5, lastUsed: 2000 },
    { name: 'Carrot', type: 'FOOD', calories: 30, usageCount: 2, lastUsed: 3000 },
];

describe('Library Sorting and Usage Count', () => {
    beforeEach(async () => {
        await db.library.clear();
        await db.items.clear();
        await db.library.bulkAdd(initialLibraryItems);
    });

    it('sorts library items by usageCount (desc) then lastUsed (desc)', async () => {
        render(<App />);

        // Open Library Modal
        const addFromLibraryBtn = await screen.findByText('Add from Library');
        fireEvent.click(addFromLibraryBtn);

        // Wait for all items to appear
        const banana = await screen.findByText('Banana');
        const carrot = await screen.findByText('Carrot');
        const apple = await screen.findByText('Apple');

        // Helper to compare vertical position
        const comparePosition = (el1, el2) => {
            return (el1.compareDocumentPosition(el2) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        };

        // Expected Order:
        // 1. Banana (count 5)
        // 2. Carrot (count 2)
        // 3. Apple (count 0)

        // Banana should be before Carrot
        expect(comparePosition(banana, carrot)).toBe(true);
        // Carrot should be before Apple
        expect(comparePosition(carrot, apple)).toBe(true);
    });

    it('increments usageCount when item is added from library', async () => {
        render(<App />);

        // Open Library
        const addFromLibraryBtn = await screen.findByText('Add from Library');
        fireEvent.click(addFromLibraryBtn);

        // Select Apple (count 0)
        const apple = await screen.findByText('Apple');
        const appleRow = apple.closest('.group');
        const checkbox = within(appleRow).getByRole('checkbox');
        fireEvent.click(checkbox);

        // Click "Add Selected"
        const addSelectedBtn = screen.getByText(/Add Selected/);
        fireEvent.click(addSelectedBtn);

        await screen.findByText(/Added 1 item/);

        // Check DB
        const appleItem = await db.library.get({ name: 'Apple' });
        expect(appleItem.usageCount).toBe(1);

        // Check others didn't change
        const bananaItem = await db.library.get({ name: 'Banana' });
        expect(bananaItem.usageCount).toBe(5);
    });

    it('initializes usageCount to 0 for new created items', async () => {
        render(<App />);

        const settingsBtn = screen.getByText('settings');
        fireEvent.click(settingsBtn);

        const manageBtn = await screen.findByText('Manage Item Library');
        fireEvent.click(manageBtn);

        const newBtn = await screen.findByText('+ New Item');
        fireEvent.click(newBtn);

        const nameInput = screen.getByPlaceholderText('Item name');
        fireEvent.change(nameInput, { target: { value: 'Mango' } });

        const calsInputs = screen.getAllByLabelText('Calories');
        const newCalsInput = calsInputs[calsInputs.length - 1];

        fireEvent.change(newCalsInput, { target: { value: '250' } });

        // Save
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(async () => {
            const mango = await db.library.get({ name: 'Mango' });
            expect(mango).toBeDefined();
            expect(mango.usageCount).toBe(0);
        });
    });

    it('sets usageCount to 1 when saving an item from log to library', async () => {
        await db.items.add({ name: 'Pizza', type: 'FOOD', calories: 800, date: new Date().toISOString().split('T')[0] });

        const { findAllByText } = render(<App />);

        const pizzas = await findAllByText('Pizza');
        // Pick the visible one? Or just the first one. ActivityItem might duplicate for mobile/desktop.
        // We just need to find the save button.
        const pizza = pizzas[0];
        const row = pizza.closest('.group');

        // Save button might be duplicated too (desktop/mobile).
        // Use getAllByTitle within the row.
        const saveBtns = within(row).getAllByTitle('Save to Library');
        const saveBtn = saveBtns[0];

        fireEvent.click(saveBtn);

        await screen.findByText('Saved to library');

        const libItem = await db.library.get({ name: 'Pizza' });
        expect(libItem).toBeDefined();
        expect(libItem.usageCount).toBe(1);
    });
});
