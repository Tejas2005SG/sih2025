import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    this.verifyConfiguration();
  }

  async verifyConfiguration() {
    try {
      // Test Twilio configuration
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      console.log('✅ SMS service ready');
    } catch (error) {
      console.error('❌ SMS service configuration error:', error.message);
    }
  }

  async sendSMSVerification(phoneNumber, verificationCode, firstName = '') {
    const message = `Hello ${firstName}! Your AyurSutra verification code is: ${verificationCode}. Valid for 10 minutes. Do not share this code with anyone.`;
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendWelcomeSMS(phoneNumber, firstName) {
    const message = `Welcome to AyurSutra Wellness, ${firstName}! Your wellness journey begins now. Visit our app to explore personalized Ayurvedic recommendations. 🌿`;
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log(`✅ Welcome SMS sent to ${phoneNumber}: ${result.sid}`);
      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('❌ Failed to send welcome SMS:', error);
      // Don't throw error for welcome SMS as it's not critical
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendAppointmentReminder(phoneNumber, firstName, appointmentDetails) {
    const { date, time, doctorName } = appointmentDetails;
    const message = `Hi ${firstName}, reminder: Your Ayurveda consultation with Dr. ${doctorName} is scheduled for ${date} at ${time}. Please join on time. - AyurSutra Wellness`;
    
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('❌ Failed to send appointment reminder:', error);
      throw new Error(`Failed to send appointment reminder: ${error.message}`);
    }
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10 && !cleaned.startsWith('91')) {
      cleaned = '91' + cleaned;
    }
    
    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check for Indian mobile number format
    const indianMobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indianMobileRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  async getMessageStatus(messageSid) {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('❌ Failed to get message status:', error);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }
}

export default new SMSService();