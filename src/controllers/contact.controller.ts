import { Request, Response } from 'express';
import * as contactService from '../services/contact.service';
import { NotFoundError } from '../utils/error.utils';

/**
 * Create new contact message (Public)
 */
export const createContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await contactService.createContactMessage(req.body);
    res.status(201).json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all contact messages (Admin only)
 */
export const getAllContactMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isRead } = req.query;
    const filters = isRead !== undefined ? { isRead: isRead === 'true' } : undefined;
    
    const result = await contactService.getAllContactMessages(filters);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get all contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get contact message by ID (Admin only)
 */
export const getContactMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = await contactService.getContactMessageById(id);
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Mark contact message as read (Admin only)
 */
export const markContactAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await contactService.markContactAsRead(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Mark contact as read error:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete contact message (Admin only)
 */
export const deleteContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await contactService.deleteContactMessage(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
