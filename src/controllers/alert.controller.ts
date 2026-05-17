import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const calculateDueDate = (priority: string = 'normal'): string => {
  const date = new Date();
  switch (priority) {
    case 'critical': date.setHours(date.getHours() + 24); break;
    case 'high': date.setHours(date.getHours() + 48); break;
    case 'normal': date.setDate(date.getDate() + 7); break;
    case 'low': date.setDate(date.getDate() + 14); break;
    default: date.setDate(date.getDate() + 7); break;
  }
  return date.toISOString();
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { category, description, location_lat, location_lng, created_by, priority } = req.body;
    const file = req.file;

    if (!category) {
      return res.status(400).json({ success: false, error: 'category is required' });
    }

    const createdBy =
      created_by && String(created_by).trim() !== '' ? String(created_by).trim() : null;
    const lat =
      location_lat != null && location_lat !== '' ? parseFloat(String(location_lat)) : null;
    const lng =
      location_lng != null && location_lng !== '' ? parseFloat(String(location_lng)) : null;

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

    const initialPriority = priority || 'normal';
    const due_date = calculateDueDate(initialPriority);

    const { data, error } = await supabase
      .from('alerts')
      .insert([
        {
          category,
          description,
          media_url,
          location_lat: lat,
          location_lng: lng,
          created_by: createdBy,
          priority: initialPriority,
          due_date
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('Error creating alert:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { category, status, department_id, priority, sla_breached } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('alerts')
      .select('*, departments(name)', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (department_id) query = query.eq('assigned_to', department_id);
    if (priority) query = query.eq('priority', priority);
    
    // Dynamic SLA filtering
    if (sla_breached === 'true') {
      query = query.lt('due_date', new Date().toISOString()).neq('status', 'resolved').neq('status', 'rejected');
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({ 
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
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: alert, error } = await supabase
      .from('alerts')
      .select('*, departments(id, name, description, contact_email, head_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    let citizen = null;
    if (alert.created_by) {
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', alert.created_by)
        .single();
      citizen = citizenData;
    }

    const { data: assignments } = await supabase
      .from('alert_assignments')
      .select('*, departments(name)')
      .eq('alert_id', id)
      .order('created_at', { ascending: false });

    const { data: comments } = await supabase
      .from('alert_comments')
      .select('*')
      .eq('alert_id', id)
      .order('created_at', { ascending: false });
      
    // Fetch public messages
    const { data: messages } = await supabase
      .from('alert_messages')
      .select('*')
      .eq('alert_id', id)
      .order('created_at', { ascending: false });

    return res.json({
      success: true,
      data: {
        ...alert,
        citizen,
        assignments: assignments || [],
        comments: comments || [],
        messages: messages || [],
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAlertStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, priority, rejection_reason } = req.body;
    const user = (req as any).user;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to || null;
    if (rejection_reason) updateData.rejection_reason = rejection_reason;

    if (priority) {
      updateData.priority = priority;
      updateData.due_date = calculateDueDate(priority); // Reset SLA when priority changes
    }

    if (assigned_to) {
      updateData.assigned_by = user.id;
    }

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', id)
      .select('*, departments(name)');

    if (error) throw error;

    if (assigned_to) {
      await supabase.from('alert_assignments').insert([{
        alert_id: id,
        department_id: assigned_to,
        assigned_by: user.id,
        assigned_by_name: user.username || 'Admin',
      }]);
    }

    if (status) {
      const statusLabels: Record<string, string> = {
        pending: 'Pending',
        under_review: 'Under Review',
        assigned: 'Assigned',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        rejected: 'Rejected',
      };
      await supabase.from('alert_comments').insert([{
        alert_id: id,
        author_id: user.id,
        author_name: user.username || 'Admin',
        content: `Status changed to "${statusLabels[status] || status}"${rejection_reason ? `: ${rejection_reason}` : ''}`,
        comment_type: 'status_change',
        metadata: { old_status: null, new_status: status },
      }]);
    }

    if (priority) {
      await supabase.from('alert_comments').insert([{
        alert_id: id,
        author_id: user.id,
        author_name: user.username || 'Admin',
        content: `Priority changed to "${priority}" - SLA Reset`,
        comment_type: 'priority_change',
        metadata: { new_priority: priority },
      }]);
    }

    res.json({ success: true, data: data[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAlertStats = async (_req: Request, res: Response) => {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('id, status, category, priority, assigned_to, created_at, resolved_at, due_date');

    if (error) throw error;

    const allAlerts = alerts || [];
    const now = new Date();

    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    let slaBreachedCount = 0;

    allAlerts.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
      const p = a.priority || 'normal';
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;
      
      if (a.due_date && a.status !== 'resolved' && a.status !== 'rejected') {
        if (new Date(a.due_date) < now) {
          slaBreachedCount++;
        }
      }
    });

    const resolved = allAlerts.filter(a => a.status === 'resolved').length;
    const resolutionRate = allAlerts.length > 0
      ? Math.round((resolved / allAlerts.length) * 100)
      : 0;

    const { data: recentAlerts } = await supabase
      .from('alerts')
      .select('*, departments(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: departments } = await supabase
      .from('departments')
      .select('id, name');

    const departmentWorkload = (departments || []).map(dept => {
      const assigned = allAlerts.filter(a => a.assigned_to === dept.id).length;
      const deptResolved = allAlerts.filter(a => a.assigned_to === dept.id && a.status === 'resolved').length;
      return { ...dept, assigned, resolved: deptResolved };
    });

    return res.json({
      success: true,
      data: {
        total: allAlerts.length,
        statusCounts,
        categoryCounts,
        priorityCounts,
        slaBreachedCount,
        resolutionRate,
        recentAlerts: recentAlerts || [],
        departmentWorkload,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const exportAlerts = async (req: Request, res: Response) => {
  try {
    const { from_date, to_date, department_id } = req.query;
    
    let query = supabase
      .from('alerts')
      .select('id, category, description, status, priority, created_at, resolved_at, departments(name)');

    if (from_date) query = query.gte('created_at', from_date);
    if (to_date) query = query.lte('created_at', to_date);
    if (department_id) query = query.eq('assigned_to', department_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Generate CSV
    const alerts = data || [];
    let csv = 'ID,Category,Description,Status,Priority,Department,Created At,Resolved At\n';
    
    alerts.forEach(a => {
      // Escape commas and quotes
      const desc = `"${(a.description || '').replace(/"/g, '""')}"`;
      const dept = `"${(a.departments as any)?.name || 'Unassigned'}"`;
      csv += `${a.id},${a.category},${desc},${a.status},${a.priority},${dept},${a.created_at},${a.resolved_at || ''}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('godawari-alerts-export.csv');
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
