import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActivityLog from './ActivityLog';

// Mock child components
vi.mock('./ActivityItem', () => ({
    default: ({ item }) => <div data-testid="activity-item">{item.name}</div>
}));

vi.mock('./QuickAdd', () => ({
    default: () => <div data-testid="quick-add">QuickAdd</div>
}));

describe('ActivityLog', () => {
    const mockItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ];

    it('renders interactions correctly', () => {
        render(
            <ActivityLog
                items={mockItems}
                onAdd={vi.fn()}
                onDelete={vi.fn()}
                onUpdate={vi.fn()}
            />
        );

        expect(screen.getByText('Activity Log')).toBeInTheDocument();
        expect(screen.getAllByTestId('activity-item')).toHaveLength(2);
        expect(screen.getByTestId('quick-add')).toBeInTheDocument();
    });

    it('renders correctly with empty items', () => {
        render(
            <ActivityLog
                items={[]}
                onAdd={vi.fn()}
                onDelete={vi.fn()}
                onUpdate={vi.fn()}
            />
        );

        expect(screen.queryByTestId('activity-item')).not.toBeInTheDocument();
        expect(screen.getByTestId('quick-add')).toBeInTheDocument();
    });
});
