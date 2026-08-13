import { supabase } from '../supabase.js';

export const TEACHER_PUBLISH_PERMISSION_MESSAGE = '沒有班級發布權限，請確認教師帳號與班級設定。';
export const TEACHER_PUBLISH_WRITE_ERROR_MESSAGE = '資料庫寫入失敗，請稍後再試。';

/**
 * Reads the current account immediately before a protected write. This avoids
 * treating an asynchronously loaded dashboard profile as an authorization
 * source while RLS remains the final server-side check.
 */
export const getCurrentTeacherProfile = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { profile: null, error: userError };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, class_code, role, status')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'teacher' || profile.status !== 'active' || !profile.class_code) {
    return { profile: null, error };
  }

  return { profile, error: null };
};

export const getTeacherPublishErrorMessage = (error) => {
  const message = String(error?.message || '').toLowerCase();
  if (error?.code === '42501' || /row-level security|permission|policy|not allowed|authorized/.test(message)) {
    return TEACHER_PUBLISH_PERMISSION_MESSAGE;
  }
  return TEACHER_PUBLISH_WRITE_ERROR_MESSAGE;
};
