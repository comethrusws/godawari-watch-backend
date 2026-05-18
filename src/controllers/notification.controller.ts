import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, type, target_type, department_id } = req.body;
    const user = (req as any).user;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          title: title.trim(),
          message: message.trim(),
          type: type || 'general',
          target_type: target_type || 'all',
          department_id: target_type === 'department' ? (department_id || null) : null,
          created_by: user.id,
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('notifications')
      .select('*, admins(full_name, avatar_url), departments(name)', { count: 'exact' });

    // Filter based on user role and department
    if (user.role === 'super_admin' || user.role === 'operator') {
      // Admins/Operators see all notifications
    } else {
      // Staff see only matching notifications
      if (user.department_id) {
        query = query.or(`target_type.eq.all,target_type.eq.staff,and(target_type.eq.department,department_id.eq.${user.department_id})`);
      } else {
        query = query.or('target_type.eq.all,target_type.eq.staff');
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formatted = (data || []).map((notif: any) => ({
      ...notif,
      creator_name: notif.admins?.full_name || 'System',
      creator_avatar: notif.admins?.avatar_url || null,
      department_name: notif.departments?.name || null,
    }));

    return res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getCitizenNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*, admins(full_name, avatar_url)', { count: 'exact' })
      .or('target_type.eq.all,target_type.eq.citizens')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formatted = (data || []).map((notif: any) => ({
      ...notif,
      creator_name: notif.admins?.full_name || 'System',
      creator_avatar: notif.admins?.avatar_url || null,
    }));

    return res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
