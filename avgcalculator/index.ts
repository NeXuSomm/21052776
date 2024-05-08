import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// Configuration
const windowSize = 10;
let storedNumbers: number[] = [];

// Middleware to parse request body as JSON
app.use(express.json());

// Route to handle incoming requests
app.post('/numbers/:numberid', async (req: Request, res: Response) => {
    try {
        const { numberid } = req.params;

        // Map number ID to corresponding API endpoint
        const apiUrlMap: { [key: string]: string } = {
            'p': 'http://20.244.56.144/prime',
            'e': 'http://20.244.56.144/even',
            'r': 'http://20.244.56.144/rand',
            'f': 'http://20.244.56.144/fibo'
        };

        // Fetch numbers based on the provided number ID
        const fetchedNumbers = await fetchNumbersBasedOnId(apiUrlMap[numberid]);

        // Update stored numbers
        updateStoredNumbers(fetchedNumbers);

        // Calculate average
        const windowPrevState = storedNumbers.slice(0, -fetchedNumbers.length);
        const windowCurrState = storedNumbers.slice(-fetchedNumbers.length);
        const avg = calculateAverage(storedNumbers);

        // Send response
        res.json({
            windowPrevState,
            windowCurrState,
            numbers: fetchedNumbers,
            avg: avg.toFixed(2)
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Function to fetch numbers based on the provided API endpoint
const fetchNumbersBasedOnId = async (apiUrl: string): Promise<number[]> => {
    try {
        const response = await axios.get(apiUrl);
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers from third-party server:', error.message);
        throw error;
    }
};

// Function to update stored numbers
const updateStoredNumbers = (newNumbers: number[]) => {
    // Ensure stored numbers are unique and maintain window size limit
    storedNumbers = [...new Set([...storedNumbers, ...newNumbers])].slice(-windowSize);
};

// Function to calculate average
const calculateAverage = (numbers: number[]): number => {
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return sum / numbers.length;
};

