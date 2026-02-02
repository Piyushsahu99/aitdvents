-- Add core_team to app_role enum (this needs to be in a separate transaction first)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'core_team';