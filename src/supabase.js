// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ffgmbjwyxacxqyecgnqu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ21iand5eGFjeHF5ZWNnbnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzkxMjUsImV4cCI6MjA5MDU1NTEyNX0.Y3mFVEq6ngHLPBQ8t04LgCS0vdUmrJNi1o5jGmqc-hU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)