-- Supabase SQL Schema for Memory in a Jar

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships Table
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) NOT NULL,
  partner_id UUID REFERENCES public.profiles(id) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly')),
  duration INTEGER NOT NULL, -- in days
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  reveal_theme TEXT DEFAULT 'neutral',
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Completed', 'Deleted')) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories Table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory Attachments Table
CREATE TABLE public.memory_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID REFERENCES public.memories(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'reveal', 'invitation')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'read')) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exports Table
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security (RLS) policies

-- Profiles: Users can only read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Relationships: Users can only access relationships they are part of
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relationships they are part of" 
  ON public.relationships FOR SELECT 
  USING (auth.uid() = creator_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create relationships" 
  ON public.relationships FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update relationships they are part of" 
  ON public.relationships FOR UPDATE 
  USING (auth.uid() = creator_id OR auth.uid() = partner_id);

-- Memories: Users can only access memories from their relationships
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memories from completed relationships they are part of" 
  ON public.memories FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = relationship_id 
      AND (relationships.creator_id = auth.uid() OR relationships.partner_id = auth.uid())
      AND relationships.status = 'Completed'
    )
  );

CREATE POLICY "Users can add memories to active relationships they are part of" 
  ON public.memories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = relationship_id 
      AND (relationships.creator_id = auth.uid() OR relationships.partner_id = auth.uid())
      AND relationships.status = 'Active'
    )
    AND auth.uid() = user_id
  );

-- Memory Attachments: Same policies as memories
ALTER TABLE public.memory_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments from completed relationships they are part of" 
  ON public.memory_attachments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memories 
      JOIN public.relationships ON memories.relationship_id = relationships.id
      WHERE memory_attachments.memory_id = memories.id
      AND (relationships.creator_id = auth.uid() OR relationships.partner_id = auth.uid())
      AND relationships.status = 'Completed'
    )
  );

CREATE POLICY "Users can add attachments to their own memories" 
  ON public.memory_attachments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories 
      WHERE memories.id = memory_id
      AND memories.user_id = auth.uid()
    )
  );

-- Notifications: Users can only access their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Exports: Users can only access their own exports
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports" 
  ON public.exports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports for completed relationships they are part of" 
  ON public.exports FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.relationships 
      WHERE relationships.id = relationship_id 
      AND (relationships.creator_id = auth.uid() OR relationships.partner_id = auth.uid())
      AND relationships.status = 'Completed'
    )
    AND auth.uid() = user_id
  );

-- Create storage buckets for memory attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('memory_attachments', 'memory_attachments', false);

-- Set up storage policies
CREATE POLICY "Users can upload their own attachments" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    auth.uid() = (storage.foldername())[1]::uuid
  );

CREATE POLICY "Users can view attachments from completed relationships they are part of" 
  ON storage.objects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.memory_attachments 
      JOIN public.memories ON memory_attachments.memory_id = memories.id
      JOIN public.relationships ON memories.relationship_id = relationships.id
      WHERE storage.filename() = memory_attachments.url
      AND (relationships.creator_id = auth.uid() OR relationships.partner_id = auth.uid())
      AND relationships.status = 'Completed'
    )
  );

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at
  BEFORE UPDATE ON public.relationships
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON public.exports
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
