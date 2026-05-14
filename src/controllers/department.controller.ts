import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getDepartments = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
