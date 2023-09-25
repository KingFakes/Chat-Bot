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
const chatHistory = [];

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
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index_backup.html')); // Menggunakan path.join untuk menggabungkan __dirname dengan path ke index.html
});

// Konfigurasi multer untuk menangani file audio
const storage = multer.memoryStorage(); // Simpan file dalam memori
const upload = multer({
    storage
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/audio', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No audio file uploaded'
        });
    }

    // Simpan file audio yang diunggah
    const audioBuffer = req.file.buffer;
    const audioFileName = `voice_message_${Date.now()}.wav`;
    const audioFilePath = path.join(__dirname, 'public', 'audio', audioFileName);

    fs.writeFileSync(audioFilePath, audioBuffer);

    // Konversi file audio ke format MP3
    const mp3FileName = audioFileName.replace('.wav', '.mp3');
    const mp3FilePath = path.join(__dirname, 'public', 'audio', mp3FileName);

    ffmpeg()
        .input(audioFilePath)
        .toFormat('mp3')
        .on('end', async () => {

            fs.unlinkSync(audioFilePath);
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(mp3FilePath),
                model: 'whisper-1',
            });

            console.log('Transkripsi Teks:');
            console.log(transcription.text);
            const transcriptionText = transcription.text;
            const userMessage = transcriptionText;
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
            fs.unlinkSync(mp3FilePath);
            res.json({
                response: botResponse
            });


        })
        .on('error', (err) => {
            console.error('Error:', err);
            res.status(500).json({
                error: 'Terjadi kesalahan saat konversi audio'
            });
        })
        .save(mp3FilePath);
});

app.post('/images', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const image = await openai.images.generate({
            prompt: userMessage
        });

        console.log(image.data[0].url);


        let botResponse = image.data[0].url;

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
function findUserHistory(userId) {
    return chatHistory.find(entry => entry.idUser === userId);
}


app.post('/clear', (req, res) => {
    const userId = req.body.userId; // Mengambil userId dari req.body

    // Mencari indeks pengguna dalam chatHistory
    const userIndex = chatHistory.findIndex(entry => entry.idUser === userId);

    if (userIndex !== -1) {
        // Jika userId ditemukan, hapus messageUser untuk userId tersebut
        chatHistory[userIndex].messsageUser.length = 0;
        res.status(200).json({
            message: `Chat history cleared for userId: ${userId}`
        });
    } else {
        res.status(404).json({
            error: `User with userId: ${userId} not found`
        });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});