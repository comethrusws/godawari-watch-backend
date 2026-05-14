import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { category, description, location_lat, location_lng, created_by } = req.body;
    const file = req.file;

    let media_url = null;

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `alerts/${fileName}`;

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
      .from('alerts')
      .insert([
        {
          category,
          description,
          media_url,
          location_lat,
          location_lng,
          created_by,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { category, status, department_id } = req.query;

    let query = supabase.from('alerts').select('*, departments(name)');

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (department_id) query = query.eq('assigned_to', department_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAlertStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    const { data, error } = await supabase
      .from('alerts')
      .update({ status, assigned_to })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
