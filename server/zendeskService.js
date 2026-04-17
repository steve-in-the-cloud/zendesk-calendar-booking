const axios = require('axios');

class ZendeskService {
  constructor() {
    // Sunshine Conversations credentials
    this.appId = process.env.SUNSHINE_APP_ID;
    this.keyId = process.env.SUNSHINE_KEY_ID;
    this.keySecret = process.env.SUNSHINE_KEY_SECRET;
    this.baseUrl = `https://api.smooch.io/v2/apps/${this.appId}`;
  }

  getAuthHeader() {
    const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async sendMessage(conversationId, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        {
          author: {
            type: 'business',
            avatarUrl: 'https://web-assets.zendesk.com/is/image/zendesk/government-photo-carousel-003'
          },
          content: {
            type: 'text',
            text: message
          }
        },
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending Zendesk message:', error.response?.data || error.message);
      throw error;
    }
  }

  formatBookingMessage(bookingDetails) {
    const startDate = new Date(bookingDetails.startTime);
    const endDate = new Date(bookingDetails.endTime);

    const dateStr = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const startTimeStr = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `✅ Booking Confirmed!\n\n` +
           `Type: ${bookingDetails.bookingType}\n` +
           `Date: ${dateStr}\n` +
           `Time: ${startTimeStr} - ${endTimeStr}\n\n` +
           `You will receive a confirmation email shortly.`;
  }
}

module.exports = new ZendeskService();
