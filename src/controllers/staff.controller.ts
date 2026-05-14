import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase';

export const getStaff = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { username, password, full_name, role } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, password_hash, full_name, role }])
      .select('id, username, full_name, role, created_at');

    if (error) throw error;
    
    console.log('Staff created successfully:', data[0]);
    
    if (!data || data.length === 0) {
      return res.status(201).json({ success: true, message: 'Staff created but no data returned' });
    }

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting self? (Optional check)
    if ((req as any).user.id === id) {
      return res.status(400).json({ success: false, error: 'You cannot delete yourself' });
    }

    const { error } = await supabase.from('admins').delete().eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Staff member removed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
