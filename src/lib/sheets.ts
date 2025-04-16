export interface MealEntry {
    date: string;
    lunch: number;
    dinner: number;
}

const SHEET_ID = '1GVaGDsybaYawCU6QjzV3PfDlRALHnflQ1joincxVQB8';
const FORM_ID = '1FAIpQLSeViabgEx4yw5EuKsy66PQfN_9VmMN0vLCAZ8eNdd7YaG207A';

export const addMealEntry = async (entry: MealEntry) => {
    try {
        // Format date as YYYY-MM-DD for the Date type field
        const date = new Date(entry.date);
        const formattedDate = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');

        const formData = new URLSearchParams({
            'entry.567462734': formattedDate,  // Now properly formatted for Date type field
            'entry.1160662286': entry.lunch.toString(),
            'entry.1287640030': entry.dinner.toString(),
        });

        console.log('Submitting form data:', Object.fromEntries(formData));

        const response = await fetch(
            `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
            {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            }
        );

        // Add a delay to allow Google to process the submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        return true;
    } catch (error) {
        console.error('Error adding meal entry:', error);
        return false;
    }
};

export const getMealEntries = async () => {
    try {
        const response = await fetch(
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch entries');
        }

        const text = await response.text();
        console.log('Fetched entries:', text);
        const rows = text.split('\n').slice(1); // Skip header row

        return rows
            .map(row => {
                const [Timestamp, date, lunch, dinner] = row.split(',').map(cell => cell.replace(/"/g, ''));
                return {
                    date: date || '',
                    lunch: parseInt(lunch) || 0,
                    dinner: parseInt(dinner) || 0,
                };
            })
            .filter(entry => entry.date); // Filter out empty rows
    } catch (error) {
        console.error('Error fetching meal entries:', error);
        return [];
    }
}; 