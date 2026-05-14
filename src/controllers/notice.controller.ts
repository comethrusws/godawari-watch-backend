import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createNotice = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const file = req.file;

    let media_url = null;

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `notices/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
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

    res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNotices = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
