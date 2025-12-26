require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Ваши данные
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const AVITO_CLIENT_ID = process.env.AVITO_CLIENT_ID;
const AVITO_CLIENT_SECRET = process.env.AVITO_CLIENT_SECRET;

// Telegram API URL
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Webhook обработчик
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Webhook получен:', JSON.stringify(req.body, null, 2));

    const event = req.body;

    // Проверяем что это сообщение
    if (event.type === 'new_message' || event.action === 'new_message') {
      const senderName = event.user?.name || event.sender?.name || 'Неизвестный';
      const messageText = event.message?.text || event.text || '';
      const senderId = event.user?.id || event.sender?.id || '';

      // Проверяем что есть текст сообщения
      if (messageText) {
        // Формируем сообщение для Telegram
        const telegramMessage = `
🔔 *Новое сообщение из Avito*

👤 *От:* ${senderName}
📱 *ID отправителя:* ${senderId}

💬 *Сообщение:*
${messageText}

---
⏰ Время: ${new Date().toLocaleString('ru-RU')}
        `.trim();

        // Отправляем в Telegram
        await axios.post(TELEGRAM_API_URL, {
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown'
        });

        console.log('✅ Сообщение отправлено в Telegram');
        res.json({ ok: true, message: 'Message sent to Telegram' });
      } else {
        res.json({ ok: false, message: 'No message text' });
      }
    } else {
      console.log('⚠️ Неизвестный тип события:', event.type);
      res.json({ ok: false, message: 'Unknown event type' });
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Для проверки что сервер живой
app.get('/', (req, res) => {
  res.json({ status: 'Avito Telegram Bot is running' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});