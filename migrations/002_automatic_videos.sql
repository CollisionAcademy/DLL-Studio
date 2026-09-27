ALTER TABLE dll.video_requests ADD COLUMN IF NOT EXISTS generation_prompt text;
ALTER TABLE dll.video_requests ADD COLUMN IF NOT EXISTS auto_delivered_at timestamptz;
