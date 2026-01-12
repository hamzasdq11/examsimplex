-- Create user_library_items table
CREATE TABLE public.user_library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'subject', 'note')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Create studylists table
CREATE TABLE public.studylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create studylist_items table
CREATE TABLE public.studylist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studylist_id UUID REFERENCES public.studylists(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('subject', 'note', 'question')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(studylist_id, item_type, item_id)
);

-- Create recent_views table
CREATE TABLE public.recent_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('university', 'course', 'subject')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  item_url TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studylist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_library_items
CREATE POLICY "Users can view their own library items"
ON public.user_library_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library items"
ON public.user_library_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library items"
ON public.user_library_items FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for studylists
CREATE POLICY "Users can view their own studylists"
ON public.studylists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own studylists"
ON public.studylists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own studylists"
ON public.studylists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own studylists"
ON public.studylists FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for studylist_items (check via studylist ownership)
CREATE POLICY "Users can view items in their studylists"
ON public.studylist_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.studylists
  WHERE studylists.id = studylist_items.studylist_id
  AND studylists.user_id = auth.uid()
));

CREATE POLICY "Users can insert items in their studylists"
ON public.studylist_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.studylists
  WHERE studylists.id = studylist_items.studylist_id
  AND studylists.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their studylists"
ON public.studylist_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.studylists
  WHERE studylists.id = studylist_items.studylist_id
  AND studylists.user_id = auth.uid()
));

-- RLS policies for recent_views
CREATE POLICY "Users can view their own recent views"
ON public.recent_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent views"
ON public.recent_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent views"
ON public.recent_views FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for studylists updated_at
CREATE TRIGGER update_studylists_updated_at
BEFORE UPDATE ON public.studylists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for recent_views to efficiently get latest
CREATE INDEX idx_recent_views_user_viewed ON public.recent_views(user_id, viewed_at DESC);