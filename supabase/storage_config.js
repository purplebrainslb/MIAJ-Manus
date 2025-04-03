// Supabase Storage Configuration Guide

// This file provides guidance on how to configure Supabase Storage for Memory in a Jar

// 1. Storage Bucket Structure
/*
The application uses a single storage bucket called 'memory_attachments' with the following structure:

memory_attachments/
├── {user_id}/
│   ├── {relationship_id}/
│   │   ├── {memory_id}/
│   │   │   ├── image_1.jpg
│   │   │   ├── video_1.mp4
│   │   │   └── audio_1.mp3
*/

// 2. File Upload Helper Functions
import { supabase } from './supabaseClient';

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param userId User ID
 * @param relationshipId Relationship ID
 * @param memoryId Memory ID
 * @returns Object containing file URL or error
 */
export const uploadFile = async (file, userId, relationshipId, memoryId) => {
  try {
    // Create file path
    const filePath = `${userId}/${relationshipId}/${memoryId}/${file.name}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('memory_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('memory_attachments')
      .getPublicUrl(filePath);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
};

/**
 * Get a file from Supabase Storage
 * @param filePath Path to the file
 * @returns Object containing file URL or error
 */
export const getFileUrl = (filePath) => {
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('memory_attachments')
      .getPublicUrl(filePath);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return { url: null, error };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param filePath Path to the file
 * @returns Object containing success status or error
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('memory_attachments')
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
};

// 3. Security Considerations
/*
- Files are protected by Row Level Security (RLS) policies
- Users can only upload files to their own user ID folder
- Users can only view files from completed relationships they are part of
- Files should be deleted when memories are deleted
*/

// 4. Implementation Notes
/*
- Maximum file size is limited to 25MB per file
- Supported file types: images (jpg, png, gif), videos (mp4, mov, avi), audio (mp3, wav, ogg)
- Thumbnails for videos should be generated and stored alongside the video files
- File URLs should be stored in the memory_attachments table for easy retrieval
*/
