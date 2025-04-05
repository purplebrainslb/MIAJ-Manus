import { supabase } from '../services/supabaseClient';

// Type definitions
interface Export {
  id: string;
  relationship_id: string;
  user_id: string;
  type: 'pdf' | 'video';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Get exports for a relationship
export const getRelationshipExports = async (relationshipId: string) => {
  try {
    const { data, error } = await supabase
      .from('exports')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { exports: data, error: null };
  } catch (error) {
    console.error('Error getting exports:', error);
    return { exports: null, error };
  }
};

// Request a new export
export const requestExport = async (relationshipId: string, type: 'pdf' | 'video') => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check if relationship is completed
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('status')
      .eq('id', relationshipId)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    if (relationship.status !== 'Completed') {
      throw new Error('Can only request exports for completed relationships');
    }
    
    // Create export record
    const { data, error } = await supabase
      .from('exports')
      .insert({
        relationship_id: relationshipId,
        user_id: user.id,
        type,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // In a real application, we would trigger a serverless function or edge function
    // to generate the export. For this demo, we'll simulate it by updating the status
    // after a short delay.
    
    // Simulate export processing
    setTimeout(async () => {
      try {
        // Update export status to completed
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days
        
        await supabase
          .from('exports')
          .update({
            status: 'completed',
            url: type === 'pdf' 
              ? 'https://example.com/exports/memory-jar-export.pdf' 
              : 'https://example.com/exports/memory-jar-export.mp4',
            expires_at: expiresAt.toISOString()
          })
          .eq('id', data.id);
        
        // Create notification for the user
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            relationship_id: relationshipId,
            type: 'reminder', // Using reminder type as we don't have an export type
            status: 'sent',
            scheduled_for: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error processing export:', error);
        
        // Update export status to failed
        await supabase
          .from('exports')
          .update({
            status: 'failed'
          })
          .eq('id', data.id);
      }
    }, 5000); // Simulate 5 second processing time
    
    return { export: data, error: null };
  } catch (error) {
    console.error('Error requesting export:', error);
    return { export: null, error };
  }
};

// Get export by ID
export const getExportById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('exports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { export: data, error: null };
  } catch (error) {
    console.error('Error getting export:', error);
    return { export: null, error };
  }
};
