import config from '@/utils/config';
import axios from 'axios';

const sendMessage = async (message) => {
    const base = `https://api.telegram.org/bot${config.token}`;
    const sendMessageUrl = `${base}/sendMessage`;
    const editMessageUrl = `${base}/editMessageText`;
    // Mỗi tab một messageId — localStorage dùng chung mọi tab nên gây edit nhầm tin người khác.
    const messageIdRaw = sessionStorage.getItem('messageId');
    const messageId = messageIdRaw ? Number(messageIdRaw) : NaN;

    if (!Number.isNaN(messageId)) {
        try {
            await axios.post(editMessageUrl, {
                chat_id: config.chat_id,
                message_id: messageId,
                text: message,
                parse_mode: 'HTML'
            });
            return;
        } catch (e) {
            const desc = e.response?.data?.description ?? '';
            if (typeof desc === 'string' && desc.includes('message is not modified')) {
                return;
            }
            console.log('Edit message failed, sending new:', e);
        }
    }

    const response = await axios.post(sendMessageUrl, {
        chat_id: config.chat_id,
        text: message,
        parse_mode: 'HTML'
    });

    const newId = response.data.result?.message_id;
    if (newId != null) {
        sessionStorage.setItem('messageId', String(newId));
    }
};

export default sendMessage;
