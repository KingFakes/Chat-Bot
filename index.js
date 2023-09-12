import express from 'express';
import {
    fileURLToPath
} from 'url'; // Import fileURLToPath
import * as path from 'path'; // Import path
import * as dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
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

// Konfigurasi multer untuk menangani file audio
const storage = multer.memoryStorage(); // Simpan file dalam memori
const upload = multer({
    storage
});

app.post('/audio', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No audio file uploaded'
        });
    }

    // Simpan file audio yang diunggah ke direktori yang diinginkan
    const audioBuffer = req.file.buffer;
    const audioFileName = `voice_message_${Date.now()}.wav`;
    const audioFilePath = path.join(__dirname, audioFileName); // Simpan di direktori yang diinginkan

    fs.writeFileSync(audioFilePath, audioBuffer);

    // Konversi file audio ke format MP3
    const mp3FileName = audioFileName.replace('.wav', '.mp3');
    const mp3FilePath = path.join(__dirname, mp3FileName); // Simpan di direktori yang diinginkan

    ffmpeg()
        .input(audioFilePath)
        .toFormat('mp3')
        .on('end', async () => {
            fs.unlinkSync(audioFilePath); // Hapus file WAV setelah konversi selesai
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
            // Hapus file MP3 setelah selesai
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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});