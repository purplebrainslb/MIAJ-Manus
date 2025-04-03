import { supabase } from '../services/supabaseClient';

// Type definitions
interface Notification {
  id: string;
  user_id: string;
  relationship_id: string;
  type: 'reminder' | 'reveal' | 'invitation';
  status: 'pending' | 'sent' | 'read';
  scheduled_for: string;
  created_at: string;
}

// Get notifications for current user
export const getUserNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        relationship:relationships(*)
      `)
      .order('scheduled_for', { ascending: false });
    
    if (error) throw error;
    
    return { notifications: data, error: null };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { notifications: null, error };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { notification: data, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { notification: null, error };
  }
};

// Create memory reminder notification
export const createMemoryReminder = async (relationshipId: string) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check if user is part of the relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    if (relationship.creator_id !== user.id && relationship.partner_id !== user.id) {
      throw new Error('Not authorized to create reminders for this relationship');
    }
    
    // Create notification for partner
    const partnerId = relationship.creator_id === user.id ? relationship.partner_id : relationship.creator_id;
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: partnerId,
        relationship_id: relationshipId,
        type: 'reminder',
        status: 'sent',
        scheduled_for: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { notification: data, error: null };
  } catch (error) {
    console.error('Error creating memory reminder:', error);
    return { notification: null, error };
  }
};

// Create reveal notification when relationship completes
export const createRevealNotification = async (relationshipId: string) => {
  try {
    // Get relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    // Create notifications for both users
    const notificationPromises = [
      supabase
        .from('notifications')
        .insert({
          user_id: relationship.creator_id,
          relationship_id: relationshipId,
          type: 'reveal',
          status: 'sent',
          scheduled_for: new Date().toISOString()
        })
        .select(),
      
      supabase
        .from('notifications')
        .insert({
          user_id: relationship.partner_id,
          relationship_id: relationshipId,
          type: 'reveal',
          status: 'sent',
          scheduled_for: new Date().toISOString()
        })
        .select()
    ];
    
    const [creatorNotification, partnerNotification] = await Promise.all(notificationPromises);
    
    if (creatorNotification.error) throw creatorNotification.error;
    if (partnerNotification.error) throw partnerNotification.error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating reveal notifications:', error);
    return { success: false, error };
  }
};
