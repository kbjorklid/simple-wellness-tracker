import { describe, it, expect } from 'vitest';
import { calculateRMR, calculateAge } from './rmr';

describe('calculateRMR', () => {
    it('calculates correctly for males', () => {
        // Example: Male, 180cm, 75kg, 30yo
        // (10 * 75) + (6.25 * 180) - (5 * 30) + 5
        // 750 + 1125 - 150 + 5 = 1730
        expect(calculateRMR(75, 180, 30, 'male')).toBe(1730);
    });

    it('calculates correctly for females', () => {
        // Example: Female, 165cm, 60kg, 28yo
        // (10 * 60) + (6.25 * 165) - (5 * 28) - 161
        // 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
        expect(calculateRMR(60, 165, 28, 'female')).toBe(1330);
    });

    it('returns 0 for missing inputs', () => {
        expect(calculateRMR(null, 180, 30, 'male')).toBe(0);
    });
});

describe('calculateAge', () => {
    it('calculates age correctly', () => {
        const today = new Date();
        const thirtyYearsAgo = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
        expect(calculateAge(thirtyYearsAgo)).toBe(30);
    });

    it('calculates age correctly with mocked time', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-01-01'));

        // 1990-01-01 to 2023-01-01 should be 33
        expect(calculateAge('1990-01-01')).toBe(33);

        vi.useRealTimers();
    });
});
