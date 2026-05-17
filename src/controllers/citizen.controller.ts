import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
};

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

export const getCitizenProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('citizens')
      .select('id, full_name, phone_number, home_lat, home_lng, device_id, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: 'Citizen not found' });
  }
};

export const updateCitizenProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, home_lat, home_lng, device_id } = req.body;

    const updateData: Record<string, any> = {};

    if (full_name !== undefined) {
      updateData.full_name = String(full_name).trim();
    }

    if (home_lat !== undefined) {
      const parsedLat = parseFloat(String(home_lat));
      if (Number.isNaN(parsedLat)) {
        return res.status(400).json({ success: false, error: 'home_lat must be a valid number' });
      }
      updateData.home_lat = parsedLat;
    }

    if (home_lng !== undefined) {
      const parsedLng = parseFloat(String(home_lng));
      if (Number.isNaN(parsedLng)) {
        return res.status(400).json({ success: false, error: 'home_lng must be a valid number' });
      }
      updateData.home_lng = parsedLng;
    }

    if (device_id !== undefined) {
      const trimmedDeviceId = String(device_id).trim();
      updateData.device_id = trimmedDeviceId === '' ? null : trimmedDeviceId;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('citizens')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, phone_number, home_lat, home_lng, device_id, created_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Citizen not found' });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getPublicCitizenAlerts = async (req: Request, res: Response) => {
  try {
    const { category, status, priority } = req.query;
    const { page, limit, from, to } = getPagination(req);

    let query = supabase
      .from('alerts')
      .select('id, category, description, media_url, location_lat, location_lng, status, priority, created_at, due_date, resolved_at, created_by, citizens(full_name)', { count: 'exact' })
      .not('created_by', 'is', null);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
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

export const getCitizenAlerts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { category, status, priority } = req.query;
    const { page, limit, from, to } = getPagination(req);

    let query = supabase
      .from('alerts')
      .select('id, category, description, media_url, location_lat, location_lng, status, priority, assigned_to, departments(name), created_at, due_date, resolved_at', { count: 'exact' })
      .eq('created_by', id);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCitizenAlertById = async (req: Request, res: Response) => {
  try {
    const { id, alertId } = req.params;

    const { data: alert, error } = await supabase
      .from('alerts')
      .select('id, category, description, media_url, location_lat, location_lng, status, priority, assigned_to, departments(id, name, description, contact_email, head_name), created_at, due_date, resolved_at, rejection_reason, created_by')
      .eq('id', alertId)
      .eq('created_by', id)
      .single();

    if (error) throw error;

    const { data: comments } = await supabase
      .from('alert_comments')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: false });

    const { data: messages } = await supabase
      .from('alert_messages')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...alert,
        comments: comments || [],
        messages: messages || [],
      }
    });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: 'Alert not found for this citizen' });
  }
};

export const addCitizenAlertMessage = async (req: Request, res: Response) => {
  try {
    const { id, alertId } = req.params;
    const { content, sender_name } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .select('id')
      .eq('id', alertId)
      .eq('created_by', id)
      .single();

    if (alertError || !alert) {
      return res.status(404).json({ success: false, error: 'Alert not found for this citizen' });
    }

    const { data, error } = await supabase
      .from('alert_messages')
      .insert([{
        alert_id: alertId,
        sender_id: id,
        sender_name: sender_name ? String(sender_name).trim() : 'Citizen',
        sender_type: 'citizen',
        content: String(content).trim(),
        read_by_admin: false,
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getCitizenAlertStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('id, status, category, priority, due_date, created_at, resolved_at')
      .eq('created_by', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const allAlerts = alerts || [];
    const now = new Date();

    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    let slaBreachedCount = 0;

    allAlerts.forEach((alert) => {
      statusCounts[alert.status] = (statusCounts[alert.status] || 0) + 1;
      categoryCounts[alert.category] = (categoryCounts[alert.category] || 0) + 1;
      const alertPriority = alert.priority || 'normal';
      priorityCounts[alertPriority] = (priorityCounts[alertPriority] || 0) + 1;

      if (alert.due_date && alert.status !== 'resolved' && alert.status !== 'rejected') {
        if (new Date(alert.due_date) < now) {
          slaBreachedCount++;
        }
      }
    });

    const total = allAlerts.length;
    const resolvedCount = statusCounts.resolved || 0;
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        total,
        statusCounts,
        categoryCounts,
        priorityCounts,
        resolvedCount,
        slaBreachedCount,
        resolutionRate,
        recentAlerts: allAlerts.slice(0, 5),
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
