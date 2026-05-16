import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getDepartments = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;

    // Get alert counts per department
    const { data: alerts } = await supabase
      .from('alerts')
      .select('assigned_to, status');

    const deptStats: Record<string, { total: number; pending: number; resolved: number }> = {};
    (alerts || []).forEach(a => {
      if (a.assigned_to) {
        if (!deptStats[a.assigned_to]) {
          deptStats[a.assigned_to] = { total: 0, pending: 0, resolved: 0 };
        }
        deptStats[a.assigned_to].total++;
        if (a.status === 'pending' || a.status === 'assigned' || a.status === 'in_progress' || a.status === 'under_review') {
          deptStats[a.assigned_to].pending++;
        }
        if (a.status === 'resolved') {
          deptStats[a.assigned_to].resolved++;
        }
      }
    });

    const enriched = (data || []).map(dept => ({
      ...dept,
      alert_count: deptStats[dept.id]?.total || 0,
      pending_count: deptStats[dept.id]?.pending || 0,
      resolved_count: deptStats[dept.id]?.resolved || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, contact_email, head_name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Department name is required' });
    }

    const { data, error } = await supabase
      .from('departments')
      .insert([{ name: name.trim(), description, contact_email, head_name }])
      .select();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, contact_email, head_name } = req.body;

    const { data, error } = await supabase
      .from('departments')
      .update({ name, description, contact_email, head_name })
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if any alerts are currently assigned to this department
    const { data: assignedAlerts, error: checkError } = await supabase
      .from('alerts')
      .select('id')
      .eq('assigned_to', id)
      .limit(1);

    if (checkError) throw checkError;

    if (assignedAlerts && assignedAlerts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with assigned alerts. Reassign or resolve them first.',
      });
    }

    const { error } = await supabase.from('departments').delete().eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Department deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
