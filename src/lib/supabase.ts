import { createClient } from '@supabase/supabase-client'

// Substitua pelos valores reais que você copiou do painel do Supabase
const supabaseUrl = 'https://lpbeuehxuadmgsbsfmcu.supabase.co/rest/v1/' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYmV1ZWh4dWFkbWdzYnNmbWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzQ5MzcsImV4cCI6MjA5MjU1MDkzN30.Pi0p6Fwt4j6BxmLTlDWWKwafOv3cbW3byMP-XbeEHxM' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
