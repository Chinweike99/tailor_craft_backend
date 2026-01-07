import { Request, Response } from 'express';
import * as feedbackService from '../services/feedback.service';
import { NotFoundError } from '../utils/error.utils';

/**
 * Create new feedback (Public)
 */
export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await feedbackService.createFeedback(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all feedback (Admin only)
 */
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isRead } = req.query;
    const filters = isRead !== undefined ? { isRead: isRead === 'true' } : undefined;
    
    const result = await feedbackService.getAllFeedback(filters);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Mark feedback as read (Admin only)
 */
export const markFeedbackAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await feedbackService.markFeedbackAsRead(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Mark feedback as read error:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to mark feedback as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete feedback (Admin only)
 */
export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await feedbackService.deleteFeedback(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
