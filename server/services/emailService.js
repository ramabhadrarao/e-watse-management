// server/services/emailService.js
// FIXED: Corrected nodemailer method name and enhanced email service

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter - FIXED: Changed from createTransporter to createTransport
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/pickups/${order._id}" 
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

  // Pickup Boy Assignment Notification
  pickupBoyAssignment: (pickupBoy, order) => ({
    subject: `New Pickup Assignment - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Pickup Assignment</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${pickupBoy.firstName},</h2>
          <p>You have been assigned a new pickup order.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.customerId.firstName} ${order.customerId.lastName}</p>
            <p><strong>Phone:</strong> ${order.customerId.phone}</p>
            <p><strong>Items:</strong> ${order.items.length} item(s)</p>
            <p><strong>Estimated Value:</strong> ₹${order.pricing.estimatedTotal.toLocaleString()}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Pickup Address:</h3>
            <p>${order.pickupDetails.address.street}<br>
               ${order.pickupDetails.address.city}, ${order.pickupDetails.address.state}<br>
               PIN: ${order.pickupDetails.address.pincode}</p>
            ${order.pickupDetails.address.landmark ? `<p><strong>Landmark:</strong> ${order.pickupDetails.address.landmark}</p>` : ''}
            <p><strong>Preferred Date:</strong> ${new Date(order.pickupDetails.preferredDate).toLocaleDateString()}</p>
            <p><strong>Time Slot:</strong> ${order.pickupDetails.timeSlot}</p>
            ${order.pickupDetails.specialInstructions ? `<p><strong>Instructions:</strong> ${order.pickupDetails.specialInstructions}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
            <h4>Important Notes:</h4>
            <ul>
              <li>Call customer before visiting: ${order.pickupDetails.contactNumber}</li>
              <li>Customer PIN for verification: <strong>${order.pinVerification.pin}</strong></li>
              <li>Update order status as you progress</li>
              <li>Verify PIN before collecting items</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pickup-boy/orders/${order._id}" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View Order Details
            </a>
          </div>
        </div>
        <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>E-Waste Management Platform - Pickup Team</p>
          <p>For support, contact: support@ewaste.org</p>
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/pickups/${order._id}" 
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/support" 
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/request" 
               style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Request Your First Pickup
            </a>
          </div>
        </div>
      </div>
    `
  }),

  // Password Reset Notification
  passwordResetNotification: (user, newPassword) => ({
    subject: 'Password Reset Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${user.firstName},</h2>
          <p>Your password has been reset by an administrator.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border: 2px solid #ef4444;">
            <h3>Your New Temporary Password:</h3>
            <p style="font-size: 18px; font-weight: bold; color: #ef4444; text-align: center; background: #fee2e2; padding: 15px; border-radius: 5px;">
              ${newPassword}
            </p>
          </div>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #ef4444;">
            <h4>Important Security Notice:</h4>
            <ul>
              <li>Please log in and change your password immediately</li>
              <li>Do not share this temporary password with anyone</li>
              <li>Choose a strong password with at least 8 characters</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               Login Now
            </a>
          </div>
        </div>
        <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>If you did not request this password reset, please contact support immediately.</p>
          <p>E-Waste Management Platform</p>
        </div>
      </div>
    `
  }),

  // Assignment Status Update for Pickup Boy
  assignmentStatusUpdate: (pickupBoy, order, oldStatus, newStatus) => ({
    subject: `Order Status Updated - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Status Updated</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello ${pickupBoy.firstName},</h2>
          <p>The status of order ${order.orderNumber} has been updated.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Status Change:</h3>
            <p><strong>From:</strong> <span style="color: #6b7280;">${oldStatus.toUpperCase()}</span></p>
            <p><strong>To:</strong> <span style="color: #3b82f6; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.customerId.firstName} ${order.customerId.lastName}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pickup-boy/orders/${order._id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
               View Order Details
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
        console.warn('⚠️  Email service not configured. Skipping email to:', to);
        console.warn('⚠️  To enable emails, set EMAIL_USER and EMAIL_PASSWORD in .env file');
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

  // Send pickup assigned email to customer
  sendPickupAssigned: async (order, customer, pickupBoy) => {
    const template = emailTemplates.pickupAssigned(order, customer, pickupBoy);
    return await emailService.sendEmail(customer.email, template);
  },

  // Send assignment notification to pickup boy
  sendPickupBoyAssignmentNotification: async (pickupBoy, order) => {
    const template = emailTemplates.pickupBoyAssignment(pickupBoy, order);
    return await emailService.sendEmail(pickupBoy.email, template);
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

  // Send password reset notification
  sendPasswordResetNotification: async (user, newPassword) => {
    const template = emailTemplates.passwordResetNotification(user, newPassword);
    return await emailService.sendEmail(user.email, template);
  },

  // Send assignment status update to pickup boy
  sendAssignmentStatusUpdate: async (pickupBoy, order, oldStatus, newStatus) => {
    const template = emailTemplates.assignmentStatusUpdate(pickupBoy, order, oldStatus, newStatus);
    return await emailService.sendEmail(pickupBoy.email, template);
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