// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://taiyivtpciubzfiefgwa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaXlpdnRwY2l1YnpmaWVmZ3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDg3NDIsImV4cCI6MjA3ODI4NDc0Mn0.WEAcGv11HEFQccncXM12Dtes2j9nL4vEf31_a6Frh4Y'

export const supabase = createClient(supabaseUrl, supabaseKey)
