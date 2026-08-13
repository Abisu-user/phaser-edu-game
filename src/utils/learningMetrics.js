// Teacher-facing reports use the same definition everywhere: one best completed
// record per student and level. This prevents totals from changing between the
// overview, analytics and individual student detail pages.
export const calculateLearningMetrics = (progressRecords = [], studentIds = []) => {
  const bestByStudentLevel = new Map();

  for (const record of progressRecords) {
    if (!record?.user_id || record.level_id == null) continue;

    const key = `${record.user_id}:${record.level_id}`;
    const current = bestByStudentLevel.get(key);
    const hasBetterStars = !current || (record.stars || 0) > (current.stars || 0);
    const isNewerTie = current && (record.stars || 0) === (current.stars || 0)
      && new Date(record.completed_at || 0).getTime() > new Date(current.completed_at || 0).getTime();

    if (hasBetterStars || isNewerTie) bestByStudentLevel.set(key, record);
  }

  const bestProgress = [...bestByStudentLevel.values()];
  const byStudent = new Map(studentIds.map(id => [id, {
    clearedLevels: 0,
    perfectClears: 0,
    totalTimeSeconds: 0
  }]));

  for (const record of bestProgress) {
    const summary = byStudent.get(record.user_id);
    if (!summary) continue;
    summary.clearedLevels += 1;
    summary.totalTimeSeconds += Number(record.time_spent_seconds) || 0;
    if (record.stars === 3) summary.perfectClears += 1;
  }

  return { bestProgress, byStudent };
};
