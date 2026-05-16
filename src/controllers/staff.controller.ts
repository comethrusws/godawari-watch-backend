import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase';

export const getStaff = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, full_name, avatar_url, role, created_at')
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
      .select('id, username, full_name, avatar_url, role, created_at');

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
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, full_name, role, avatar_url } = req.body;

    let updateData: any = { username, full_name, role };
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, username, full_name, avatar_url, role, created_at');

    if (error) throw error;
    return res.json({ success: true, data: data[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getStaffPerformance = async (req: Request, res: Response) => {
  try {
    // Verify super_admin
    if ((req as any).user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get all staff
    const { data: admins } = await supabase
      .from('admins')
      .select('id, username, full_name, avatar_url, role, created_at');

    if (!admins) return res.json({ success: true, data: [] });

    // Get all resolved comments (to count resolutions)
    const { data: resolutionComments } = await supabase
      .from('alert_comments')
      .select('author_id')
      .eq('comment_type', 'status_change')
      .contains('metadata', { new_status: 'resolved' });

    // Get all general activity (total comments made by each admin)
    const { data: allComments } = await supabase
      .from('alert_comments')
      .select('author_id, created_at');

    const { data: allAssignments } = await supabase
      .from('alert_assignments')
      .select('assigned_by, created_at');

    const { data: allAlerts } = await supabase
      .from('alerts')
      .select('assigned_by, resolved_at')
      .not('assigned_by', 'is', null);

    const performance = admins.map((admin: any) => {
      const resolutions = resolutionComments?.filter(c => c.author_id === admin.id).length || 0;
      const adminComments = allComments?.filter(c => c.author_id === admin.id) || [];
      const adminAssignments = allAssignments?.filter(a => a.assigned_by === admin.id) || [];
      const adminAlerts = allAlerts?.filter(a => a.assigned_by === admin.id).map(a => ({ created_at: a.resolved_at || new Date().toISOString() })) || [];
      
      const activities = [...adminComments, ...adminAssignments, ...adminAlerts];

      const totalActivities = activities.length;
      const commentsCount = adminComments.length;
      const assignmentsCount = adminAssignments.length;
      
      // Get the last active date (fallback to admin.created_at if we want, or keep null)
      let lastActive = activities.length > 0 
        ? activities.reduce((latest, current) => 
            new Date(current.created_at || 0) > new Date(latest.created_at || 0) ? current : latest
          ).created_at 
        : null;

      if (!lastActive && admin.created_at) {
        lastActive = admin.created_at; // Fallback to account creation if no activity
      }

      return {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        avatar_url: admin.avatar_url,
        role: admin.role,
        resolutions,
        commentsCount,
        assignmentsCount,
        totalActivities,
        lastActive
      };
    });

    return res.json({ success: true, data: performance });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
