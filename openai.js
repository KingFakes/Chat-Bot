import axios from 'axios';

let data = JSON.stringify({
    "model": "gpt-3.5-turbo",
    "messages": [{
        "role": "user",
        "content": "3 kata kerja"
    }],
    "stream": true,
    "temperature": 0.5,
    "max_tokens": 256
});

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
    },
    data: data
};

axios.request(config)
    .then((response) => {
        const choices = response.data.choices;
        if (Array.isArray(choices)) {
            for (const choice of choices) {
                if (choice.delta && choice.delta.content) {
                    console.log(choice.delta.content);
                }
            }
        }
    })
    .catch((error) => {
        console.log(error);
    });