import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `media/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    res.status(201).json({ 
      success: true, 
      data: { 
        url: publicUrl,
        path: filePath,
        filename: fileName
      } 
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
