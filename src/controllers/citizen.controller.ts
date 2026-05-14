import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const registerCitizen = async (req: Request, res: Response) => {
  try {
    const { full_name, phone_number, home_lat, home_lng, device_id } = req.body;

    const { data, error } = await supabase
      .from('citizens')
      .upsert({ full_name, phone_number, home_lat, home_lng, device_id }, { onConflict: 'phone_number' })
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCitizen = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const { data, error } = await supabase
      .from('citizens')
      .select('*')
      .eq('phone_number', phone)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Citizen not found' });
  }
};
