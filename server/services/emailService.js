// server/services/emailService.js
// Fixed email service with correct nodemailer syntax

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter - Fixed syntax
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  orderConfirmation: (order, customer) => ({
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${customer.firstName},</h2>
          <p>Your e-waste pickup order has been confirmed.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Pickup PIN:</strong> <span style="font-size: 18px; font-weight: bold; color: #22c55e;">${order.pinVerification.pin}</span></p>
            <p><strong>Items:</strong> ${order.items.length} item(s)</p>
            <p><strong>Estimated Value:</strong> ₹${order.pricing.estimatedTotal.toLocaleString()}</p>
            <p><strong>Pickup Date:</strong> ${new Date(order.pickupDetails.preferredDate).toLocaleDateString()}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h4>Important:</h4>
            <p>Please keep your <strong>Pickup PIN (${order.pinVerification.pin})</strong> ready. You'll need to share this with our pickup executive for verification.</p>
          </div>
          
          <p>We'll notify you when a pickup executive is assigned to your order.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/pickups/${order._id}" 
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Track Your Order
            </a>
          </div>
        </div>
        <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Thank you for choosing our e-waste management service!</p>
          <p>For support, contact us at support@ewaste.org</p>
        </div>
      </div>
    `
  }),

  pickupAssigned: (order, customer, pickupBoy) => ({
    subject: `Pickup Executive Assigned - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Pickup Executive Assigned</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${customer.firstName},</h2>
          <p>Great news! A pickup executive has been assigned to your order.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Pickup Executive Details:</h3>
            <p><strong>Name:</strong> ${pickupBoy.firstName} ${pickupBoy.lastName}</p>
            <p><strong>Phone:</strong> ${pickupBoy.phone}</p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Your PIN:</strong> <span style="font-size: 18px; font-weight: bold; color: #3b82f6;">${order.pinVerification.pin}</span></p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <p>The pickup executive will contact you before arrival. Please have your items ready and your PIN available for verification.</p>
          </div>
        </div>
      </div>
    `
  }),

  orderCompleted: (order, customer) => ({
    subject: `Order Completed - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #22c55e; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Completed Successfully!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${customer.firstName},</h2>
          <p>Your e-waste pickup order has been completed successfully!</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Final Settlement:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Items Collected:</strong> ${order.items.length}</p>
            <p><strong>Final Amount:</strong> ₹${(order.pricing.actualTotal || order.pricing.estimatedTotal).toLocaleString()}</p>
          </div>
          
          <p>Thank you for contributing to environmental sustainability!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/pickups/${order._id}" 
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Download Receipt
            </a>
          </div>
        </div>
      </div>
    `
  }),

  supportTicketCreated: (ticket, customer) => ({
    subject: `Support Ticket Created - ${ticket.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Support Ticket Created</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${customer.firstName},</h2>
          <p>We've received your support request and created a ticket for you.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Ticket Details:</h3>
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
            <p><strong>Status:</strong> ${ticket.status.toUpperCase()}</p>
          </div>
          
          <p>Our support team will respond within 24 hours. You can track your ticket status in your dashboard.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/support" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View Ticket
            </a>
          </div>
        </div>
      </div>
    `
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to E-Waste Management Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to E-Waste Platform!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName},</h2>
          <p>Welcome to our e-waste management platform! We're excited to have you join our mission to create a cleaner, greener future.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>What you can do:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Schedule convenient pickup times</li>
              <li>Get instant price estimates</li>
              <li>Track your orders in real-time</li>
              <li>View your environmental impact</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/request" 
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Request Your First Pickup
            </a>
          </div>
        </div>
      </div>
    `
  })
};

export const emailService = {
  // Send email with better error handling
  sendEmail: async (to, template) => {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email service not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
      }

      const mailOptions = {
        from: `"E-Waste Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: template.subject,
        html: template.html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send order confirmation email
  sendOrderConfirmation: async (order, customer) => {
    const template = emailTemplates.orderConfirmation(order, customer);
    return await emailService.sendEmail(customer.email, template);
  },

  // Send pickup assigned email
  sendPickupAssigned: async (order, customer, pickupBoy) => {
    const template = emailTemplates.pickupAssigned(order, customer, pickupBoy);
    return await emailService.sendEmail(customer.email, template);
  },

  // Send order completed email
  sendOrderCompleted: async (order, customer) => {
    const template = emailTemplates.orderCompleted(order, customer);
    return await emailService.sendEmail(customer.email, template);
  },

  // Send support ticket created email
  sendSupportTicketCreated: async (ticket, customer) => {
    const template = emailTemplates.supportTicketCreated(ticket, customer);
    return await emailService.sendEmail(customer.email, template);
  },

  // Send welcome email
  sendWelcomeEmail: async (user) => {
    const template = emailTemplates.welcomeEmail(user);
    return await emailService.sendEmail(user.email, template);
  },

  // Send custom email
  sendCustomEmail: async (to, subject, content) => {
    const template = {
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px; background: #f9f9f9;">
            ${content}
          </div>
          <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>E-Waste Management Platform</p>
          </div>
        </div>
      `
    };
    return await emailService.sendEmail(to, template);
  },

  // Test email connectivity
  testConnection: async () => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return { success: false, error: 'Email credentials not configured' };
      }

      await transporter.verify();
      console.log('✅ Email service connection verified');
      return { success: true, message: 'Email service connected successfully' };
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};