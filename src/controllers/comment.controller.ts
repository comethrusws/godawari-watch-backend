import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getComments = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const { data, error } = await supabase
      .from('alert_comments')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { content } = req.body;
    const user = (req as any).user;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content is required' });
    }

    const { data, error } = await supabase
      .from('alert_comments')
      .insert([{
        alert_id: alertId,
        author_id: user.id,
        author_name: user.username || 'Admin',
        content: content.trim(),
        comment_type: 'comment',
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const addCitizenMessage = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { content } = req.body;
    const user = (req as any).user;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const { data, error } = await supabase
      .from('alert_messages')
      .insert([{
        alert_id: alertId,
        sender_id: user.id,
        sender_name: user.username || 'Admin',
        sender_type: 'admin',
        content: content.trim(),
        read_by_admin: true,
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
