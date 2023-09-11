import express from 'express';
import {
    fileURLToPath
} from 'url'; // Import fileURLToPath
import * as path from 'path'; // Import path
import * as dotenv from 'dotenv';
import cors from 'cors';
import {
    OpenAI
} from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
app.use(cors());
app.use(express.json());

// Menggunakan import.meta.url dan fileURLToPath untuk mengakses __dirname
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Menggunakan path.join untuk menggabungkan __dirname dengan path ke index.html
});

const chatHistory = [];
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const messages = [{
            "role": "user",
            "content": userMessage
        }];
        chatHistory.push(messages);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: chatHistory.flat(),
        });

        let botResponse = completion.choices[0].message.content;
        console.log(completion.choices[0].message.content);

        // Menghapus spasi di awal dan akhir dari botResponse
        botResponse = botResponse.trim();
        chatHistory.push([{
            "role": "assistant",
            "content": botResponse
        }]);

        console.log(chatHistory);

        res.json({
            response: botResponse
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'An error occurred'
        });
    }
});
app.post('/clear', (req, res) => {
    chatHistory.length = 0; // Mengosongkan array chatHistory
    res.status(200).json({
        message: 'Chat history cleared'
    });
});

function isDesiredFormat(chunk) {
    // Memeriksa apakah objek chunk memiliki format yang diinginkan
    return (
        chunk.object === "chat.completion.chunk" &&
        chunk.choices &&
        chunk.choices[0] &&
        chunk.choices[0].delta &&
        chunk.choices[0].delta.content
    );
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});