/**
 * Calculates RMR using the Mifflin-St Jeor equation.
 * 
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @param {number} ageYears - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} The calculated RMR
 */
export function calculateRMR(weightKg, heightCm, ageYears, gender) {
    if (!weightKg || !heightCm || !ageYears || !gender) {
        return 0;
    }

    // Mifflin-St Jeor Equation
    // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

    let rmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);

    if (gender.toLowerCase() === 'male') {
        rmr += 5;
    } else {
        rmr -= 161;
    }

    return Math.round(rmr);
}

export const ACTIVITY_FACTORS = {
    sedentary: { value: 1.2, label: 'Sedentary (little or no exercise)' },
    light: { value: 1.375, label: 'Lightly energetic (light exercise 1-3 days/week)' },
    moderate: { value: 1.55, label: 'Moderately energetic (moderate exercise 3-5 days/week)' },
    active: { value: 1.725, label: 'Very energetic (hard exercise 6-7 days/week)' },
    extra: { value: 1.9, label: 'Extra energetic (very hard exercise & physical job)' }
};

/**
 * Calculates age from Date of Birth
 * @param {string|Date} dob - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
    if (!dob) return 0;
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
