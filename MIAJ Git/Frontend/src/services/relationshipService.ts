import { supabase } from '../services/supabaseClient';
import { uploadFile } from '../../supabase/storage_config';

// Type definitions
interface Relationship {
  id: string;
  name: string;
  type: string;
  creator_id: string;
  partner_id: string;
  frequency: string;
  duration: number;
  start_date?: string;
  end_date?: string;
  reveal_theme: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  partner?: Profile;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  auth_provider: string;
}

// Get all relationships for current user
export const getUserRelationships = async () => {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select(`
        *,
        creator:profiles!creator_id(*),
        partner:profiles!partner_id(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { relationships: data, error: null };
  } catch (error) {
    console.error('Error getting relationships:', error);
    return { relationships: null, error };
  }
};

// Get relationship by ID
export const getRelationshipById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select(`
        *,
        creator:profiles!creator_id(*),
        partner:profiles!partner_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { relationship: data, error: null };
  } catch (error) {
    console.error('Error getting relationship:', error);
    return { relationship: null, error };
  }
};

// Create new relationship
export const createRelationship = async (relationshipData: {
  name: string;
  type: string;
  partnerEmail: string;
  frequency: string;
  duration: string;
  revealTheme?: string;
}) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Find partner by email
    const { data: partnerData, error: partnerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', relationshipData.partnerEmail)
      .single();
    
    if (partnerError) throw new Error('Partner not found. They need to register first.');
    
    // Convert duration string to days
    let durationDays;
    switch (relationshipData.duration) {
      case '3 months':
        durationDays = 90;
        break;
      case '6 months':
        durationDays = 180;
        break;
      case '1 year':
        durationDays = 365;
        break;
      default:
        durationDays = parseInt(relationshipData.duration);
    }
    
    // Create relationship
    const { data: relationship, error } = await supabase
      .from('relationships')
      .insert({
        name: relationshipData.name,
        type: relationshipData.type,
        creator_id: user.id,
        partner_id: partnerData.id,
        frequency: relationshipData.frequency,
        duration: durationDays,
        reveal_theme: relationshipData.revealTheme || 'neutral',
        status: 'Pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create invitation notification
    await supabase
      .from('notifications')
      .insert({
        user_id: partnerData.id,
        relationship_id: relationship.id,
        type: 'invitation',
        status: 'pending',
        scheduled_for: new Date().toISOString()
      });
    
    // Get relationship with creator and partner info
    const { relationship: relationshipWithProfiles } = await getRelationshipById(relationship.id);
    
    return { relationship: relationshipWithProfiles, error: null };
  } catch (error) {
    console.error('Error creating relationship:', error);
    return { relationship: null, error };
  }
};

// Accept relationship invitation
export const acceptRelationship = async (id: string) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get relationship
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    // Check if user is the partner
    if (relationship.partner_id !== user.id) {
      throw new Error('Not authorized to accept this invitation');
    }
    
    // Check if relationship is pending
    if (relationship.status !== 'Pending') {
      throw new Error('Relationship is not in pending state');
    }
    
    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + relationship.duration);
    
    // Update relationship
    const { data: updatedRelationship, error } = await supabase
      .from('relationships')
      .update({
        status: 'Active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Get relationship with creator and partner info
    const { relationship: relationshipWithProfiles } = await getRelationshipById(id);
    
    return { relationship: relationshipWithProfiles, error: null };
  } catch (error) {
    console.error('Error accepting relationship:', error);
    return { relationship: null, error };
  }
};

// Delete relationship
export const deleteRelationship = async (id: string) => {
  try {
    // Update relationship status to Deleted
    const { error } = await supabase
      .from('relationships')
      .update({ status: 'Deleted' })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return { success: false, error };
  }
};
