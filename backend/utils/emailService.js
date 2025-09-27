import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL_USER,
        pass: process.env.GOOGLE_APP_PASSWORD
      },
      secure: true,
      port: 465
    });
    
    // Verify transporter configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready');
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
    }
  }

  async sendPasswordResetEmail(email, resetToken, firstName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'AyurSutra Wellness',
        address: process.env.GOOGLE_EMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - AyurSutra Wellness',
      html: this.getPasswordResetTemplate(firstName, resetUrl),
      text: `Dear ${firstName},\n\nYou have requested to reset your password. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\nBest regards,\nAyurSutra Wellness Team`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: {
        name: 'AyurSutra Wellness',
        address: process.env.GOOGLE_EMAIL_USER
      },
      to: email,
      subject: 'Welcome to AyurSutra Wellness - Your Wellness Journey Begins!',
      html: this.getWelcomeTemplate(firstName),
      text: `Dear ${firstName},\n\nWelcome to AyurSutra Wellness! We're excited to have you join our community dedicated to holistic health and wellness through Ayurveda.\n\nYour account has been successfully created and verified. You can now access your personalized dashboard and begin your wellness journey.\n\nBest regards,\nAyurSutra Wellness Team`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't throw error for welcome email as it's not critical
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(email, verificationToken, firstName) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: {
        name: 'AyurSutra Wellness',
        address: process.env.GOOGLE_EMAIL_USER
      },
      to: email,
      subject: 'Verify Your Email - AyurSutra Wellness',
      html: this.getEmailVerificationTemplate(firstName, verificationUrl),
      text: `Dear ${firstName},\n\nPlease verify your email address by clicking the following link:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nAyurSutra Wellness Team`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email verification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  getPasswordResetTemplate(firstName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - AyurSutra Wellness</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a085, #2ecc71); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; background: #16a085; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 AyurSutra Wellness</h1>
          <p>Your Holistic Health Partner</p>
        </div>
        
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Dear ${firstName},</p>
          
          <p>We received a request to reset your password for your AyurSutra Wellness account. If you made this request, please click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in <strong>15 minutes</strong></li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #16a085;">${resetUrl}</p>
          
          <p>For security reasons, we recommend:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication</li>
            <li>Not sharing your account credentials</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent from AyurSutra Wellness. If you have any questions, please contact our support team.</p>
          <p>&copy; 2025 AyurSutra Wellness. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AyurSutra Wellness</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a085, #2ecc71); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; background: #16a085; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          .feature { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #16a085; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Welcome to AyurSutra Wellness!</h1>
          <p>Your Journey to Holistic Health Begins Here</p>
        </div>
        
        <div class="content">
          <h2>Namaste ${firstName}! 🙏</h2>
          
          <p>We're thrilled to welcome you to the AyurSutra Wellness community! Your account has been successfully created and verified.</p>
          
          <h3>What's Next?</h3>
          
          <div class="feature">
            <h4>🔍 Explore Your Dosha Profile</h4>
            <p>Discover your unique Ayurvedic constitution and get personalized recommendations.</p>
          </div>
          
          <div class="feature">
            <h4>📋 Complete Your Health Assessment</h4>
            <p>Help us understand your health goals and create a tailored wellness plan.</p>
          </div>
          
          <div class="feature">
            <h4>👨‍⚕️ Book Your First Consultation</h4>
            <p>Connect with our certified Ayurvedic practitioners for personalized guidance.</p>
          </div>
          
          <div class="feature">
            <h4>📚 Access Wellness Resources</h4>
            <p>Explore our library of articles, recipes, and lifestyle tips.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Your Dashboard</a>
          </div>
          
          <h3>Need Help?</h3>
          <p>Our support team is here to help you every step of the way. Feel free to reach out if you have any questions about your wellness journey.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing AyurSutra Wellness for your holistic health journey.</p>
          <p>&copy; 2025 AyurSutra Wellness. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(firstName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - AyurSutra Wellness</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a085, #2ecc71); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; background: #16a085; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 AyurSutra Wellness</h1>
          <p>Email Verification Required</p>
        </div>
        
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Dear ${firstName},</p>
          
          <p>Thank you for registering with AyurSutra Wellness! To complete your account setup, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Email</a>
          </div>
          
          <p>This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #16a085;">${verificationUrl}</p>
        </div>
        
        <div class="footer">
          <p>Welcome to your wellness journey with AyurSutra!</p>
          <p>&copy; 2025 AyurSutra Wellness. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();