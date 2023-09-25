import express from 'express';
import {
    fileURLToPath
} from 'url';
import * as path from 'path';
import * as dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import axios from 'axios'; // Import Axios for making HTTP requests

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// ...

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const userId = req.body.userId;

    try {
        let userHistory = findUserHistory(userId);

        if (!userHistory) {
            userHistory = {
                idUser: userId,
                messsageUser: [],
            };
            chatHistory.push(userHistory);
        }

        userHistory.messsageUser.push({
            role: 'user',
            content: userMessage,
        });

        // Make a POST request to the OpenAI API endpoint
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: chatHistory.map((entry) => entry.messsageUser).flat(),
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const botResponse = response.data.choices[0].message.content.trim();

        userHistory.messsageUser.push({
            role: 'assistant',
            content: botResponse,
        });

        console.log(chatHistory);

        res.json({
            response: botResponse,
            listmessages: chatHistory,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'An error occurred',
        });
    }
});

// ...

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
