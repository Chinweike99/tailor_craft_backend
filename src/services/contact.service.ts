import { prisma } from '../config/database';
import { CreateContactInput } from '../validation/contact.validation';

/**
 * Create a new contact message
 */
export const createContactMessage = async (data: CreateContactInput) => {
  const contact = await prisma.contactUs.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    },
  });

  return {
    message: 'Your message has been sent successfully. We will get back to you soon!',
    contact: {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      createdAt: contact.createdAt,
    },
  };
};

/**
 * Get all contact messages (Admin only)
 */
export const getAllContactMessages = async (filters?: { isRead?: boolean }) => {
  const where = filters?.isRead !== undefined ? { isRead: filters.isRead } : {};

  const messages = await prisma.contactUs.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.contactUs.count({ where });

  return {
    messages,
    total,
  };
};

/**
 * Get contact message by ID (Admin only)
 */
export const getContactMessageById = async (id: string) => {
  const message = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!message) {
    throw new Error('Contact message not found');
  }

  return message;
};

/**
 * Mark contact message as read (Admin only)
 */
export const markContactAsRead = async (id: string) => {
  const contact = await prisma.contactUs.update({
    where: { id },
    data: { isRead: true },
  });

  return {
    message: 'Contact message marked as read',
    contact,
  };
};

/**
 * Delete contact message (Admin only)
 */
export const deleteContactMessage = async (id: string) => {
  await prisma.contactUs.delete({
    where: { id },
  });

  return {
    message: 'Contact message deleted successfully',
  };
};
