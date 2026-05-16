import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getNotices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('notices')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({ 
      success: true, 
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getNoticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createNotice = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const file = req.file;

    let media_url = null;

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `notices/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('notices')
      .insert([{ title, content, media_url }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const file = req.file;

    let updateData: any = { title, content };

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `notices/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      updateData.media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('notices')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
