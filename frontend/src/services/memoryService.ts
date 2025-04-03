import { supabase } from '../services/supabaseClient';
import { uploadFile, getFileUrl, deleteFile } from '../supabase/storage_config';

// Type definitions
interface Memory {
  id: string;
  relationship_id: string;
  user_id: string;
  text?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  attachments?: MemoryAttachment[];
}

interface MemoryAttachment {
  id: string;
  memory_id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail_url?: string;
  size: number;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  auth_provider: string;
}

// Get memories for a relationship (only if relationship is completed)
export const getRelationshipMemories = async (relationshipId: string) => {
  try {
    // First check if relationship is completed
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('status')
      .eq('id', relationshipId)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    if (relationship.status !== 'Completed') {
      throw new Error('Memories are only available after the relationship is completed');
    }
    
    // Get memories with user info
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select(`
        *,
        user:profiles!user_id(*)
      `)
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: true });
    
    if (memoriesError) throw memoriesError;
    
    // Get attachments for each memory
    const memoriesWithAttachments = await Promise.all(
      memories.map(async (memory) => {
        const { data: attachments, error: attachmentsError } = await supabase
          .from('memory_attachments')
          .select('*')
          .eq('memory_id', memory.id);
        
        if (attachmentsError) throw attachmentsError;
        
        return {
          ...memory,
          attachments: attachments || []
        };
      })
    );
    
    return { memories: memoriesWithAttachments, error: null };
  } catch (error) {
    console.error('Error getting memories:', error);
    return { memories: null, error };
  }
};

// Add a new memory
export const addMemory = async (
  relationshipId: string,
  memoryData: {
    text?: string;
    attachments?: File[];
  }
) => {
  try {
    // Validate that either text or attachments are provided
    if (!memoryData.text && (!memoryData.attachments || memoryData.attachments.length === 0)) {
      throw new Error('Either text or attachments are required');
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check if relationship is active
    const { data: relationship, error: relationshipError } = await supabase
      .from('relationships')
      .select('status')
      .eq('id', relationshipId)
      .single();
    
    if (relationshipError) throw relationshipError;
    
    if (relationship.status !== 'Active') {
      throw new Error('Can only add memories to active relationships');
    }
    
    // Create memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert({
        relationship_id: relationshipId,
        user_id: user.id,
        text: memoryData.text
      })
      .select()
      .single();
    
    if (memoryError) throw memoryError;
    
    // Upload attachments if any
    if (memoryData.attachments && memoryData.attachments.length > 0) {
      const attachmentPromises = memoryData.attachments.map(async (file) => {
        // Upload file to Supabase Storage
        const { url, error: uploadError } = await uploadFile(
          file,
          user.id,
          relationshipId,
          memory.id
        );
        
        if (uploadError) throw uploadError;
        
        // Determine file type
        let fileType: 'image' | 'video' | 'audio';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else {
          fileType = 'audio';
        }
        
        // Create attachment record
        const { data: attachment, error: attachmentError } = await supabase
          .from('memory_attachments')
          .insert({
            memory_id: memory.id,
            type: fileType,
            url: url,
            size: file.size
          })
          .select()
          .single();
        
        if (attachmentError) throw attachmentError;
        
        return attachment;
      });
      
      const attachments = await Promise.all(attachmentPromises);
      
      // Get user info
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;
      
      return {
        memory: {
          ...memory,
          user: userProfile,
          attachments
        },
        error: null
      };
    }
    
    // Get user info
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) throw userError;
    
    return {
      memory: {
        ...memory,
        user: userProfile,
        attachments: []
      },
      error: null
    };
  } catch (error) {
    console.error('Error adding memory:', error);
    return { memory: null, error };
  }
};
