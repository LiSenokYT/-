import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://nbqoepiouxikzganqodg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icW9lcGlvdXhpa3pnYW5xb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODQwNTcsImV4cCI6MjA3ODM2MDA1N30.iJY3DYuLPSLArZx6zVTXoowW58HgJT5R3dNIZLNsrIo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
