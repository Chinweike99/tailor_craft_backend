import { prisma } from '../config/database';
import { CreateFeedbackInput } from '../validation/feedback.validation';

/**
 * Create a new feedback
 */
export const createFeedback = async (data: CreateFeedbackInput) => {
  const feedback = await prisma.feedback.create({
    data: {
      email: data.email,
      message: data.message,
    },
  });

  return {
    message: 'Feedback submitted successfully. Thank you!',
    feedback: {
      id: feedback.id,
      email: feedback.email,
      message: feedback.message,
      createdAt: feedback.createdAt,
    },
  };
};

/**
 * Get all feedback (Admin only)
 */
export const getAllFeedback = async (filters?: { isRead?: boolean }) => {
  const where = filters?.isRead !== undefined ? { isRead: filters.isRead } : {};

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.feedback.count({ where });

  return {
    feedbacks,
    total,
  };
};

/**
 * Mark feedback as read (Admin only)
 */
export const markFeedbackAsRead = async (id: string) => {
  const feedback = await prisma.feedback.update({
    where: { id },
    data: { isRead: true },
  });

  return {
    message: 'Feedback marked as read',
    feedback,
  };
};

/**
 * Delete feedback (Admin only)
 */
export const deleteFeedback = async (id: string) => {
  await prisma.feedback.delete({
    where: { id },
  });

  return {
    message: 'Feedback deleted successfully',
  };
};
