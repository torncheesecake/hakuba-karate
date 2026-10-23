// App practice awards only. Belt grades remain separate, self-recorded milestones.
(() => {
  const icons = /* ACHIEVEMENT_ICONS */ {};
  const tiers = {
    bronze: { label: 'Bronze', detail: 'Build the habit', rank: 1 },
    silver: { label: 'Silver', detail: 'Keep progressing', rank: 2 },
    gold: { label: 'Gold', detail: 'Go further', rank: 3 },
    platinum: { label: 'Platinum', detail: 'A sustained challenge', rank: 4 },
    elite: { label: 'Elite', detail: 'A long-term achievement', rank: 5 },
    special: { label: 'Milestone', detail: 'Something different', rank: 0 },
    grade: { label: 'Recorded grade', detail: 'Your grading record', rank: 0 },
  };
  const categories = { syllabus: 'Syllabus', quiz: 'Quiz & recall', practice: 'Practice habits', study: 'Study', grades: 'Recorded grades', collection: 'Collection' };
  const count = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const metric = (stat, target, tier, category, unit) => ({ stat, target, tier, category, unit });

  // Existing IDs and rewards stay in the app's original catalogue.
  const legacy = {
    first_steps: metric('techniquesLearned', 1, 'bronze', 'syllabus', 'techniques'),
    half_century: metric('techniquesLearned', 50, 'gold', 'syllabus', 'techniques'),
    technique_collector: metric('techniquesLearned', 100, 'platinum', 'syllabus', 'techniques'),
    belt_master: metric('beltsCompleted', 1, 'gold', 'syllabus', 'syllabuses'),
    karate_master: metric('allTechniquesLearned', 1, 'elite', 'syllabus', 'complete collection'),
    dedicated_student: metric('quizzesCompleted', 10, 'silver', 'quiz', 'quizzes'),
    quiz_champion: metric('quizzesCompleted', 25, 'silver', 'quiz', 'quizzes'),
    quiz_warrior: metric('quizzesCompleted', 50, 'gold', 'quiz', 'quizzes'),
    quiz_veteran: metric('quizzesCompleted', 100, 'platinum', 'quiz', 'quizzes'),
    sharpshooter: metric('perfectQuizzes', 1, 'bronze', 'quiz', 'perfect quizzes'),
    perfectionist: metric('perfectQuizzes', 5, 'silver', 'quiz', 'perfect quizzes'),
    perfect_ten: metric('perfectQuizzes', 10, 'gold', 'quiz', 'perfect quizzes'),
    on_fire: metric('bestStreak', 5, 'bronze', 'quiz', 'correct in a row'),
    ten_streak: metric('bestStreak', 10, 'silver', 'quiz', 'correct in a row'),
    streak_master: metric('bestStreak', 15, 'gold', 'quiz', 'correct in a row'),
    terminology_novice: metric('correctAnswers', 25, 'bronze', 'quiz', 'correct answers'),
    century: metric('correctAnswers', 100, 'silver', 'quiz', 'correct answers'),
    terminology_expert: metric('correctAnswers', 500, 'gold', 'quiz', 'correct answers'),
    thousand_answers: metric('correctAnswers', 1000, 'platinum', 'quiz', 'correct answers'),
    triple_threat: metric('bestConsecutivePerfect', 3, 'gold', 'quiz', 'perfect quizzes in a row'),
    daily_dedication: metric('dailyChallengesCompleted', 7, 'silver', 'practice', 'daily challenges'),
    daily_devotee: metric('dailyChallengesCompleted', 30, 'gold', 'practice', 'daily challenges'),
    daily_streak_3: metric('practiceStreak', 3, 'bronze', 'practice', 'consecutive days'),
    consistent: metric('practiceStreak', 7, 'silver', 'practice', 'consecutive days'),
    daily_streak_14: metric('practiceStreak', 14, 'gold', 'practice', 'consecutive days'),
    daily_streak_30: metric('practiceStreak', 30, 'platinum', 'practice', 'consecutive days'),
    scholar: metric('categoriesStudied', 8, 'gold', 'study', 'categories'),
    weak_spot_warrior: metric('weakSpotsQuizzesCompleted', 5, 'silver', 'study', 'weak-spots quizzes'),
    rising_star: metric('badgesEarned', 5, 'bronze', 'collection', 'achievements'),
    xp_collector: metric('totalXP', 1000, 'silver', 'collection', 'XP'),
    xp_enthusiast: metric('totalXP', 2500, 'gold', 'collection', 'XP'),
    xp_master: metric('totalXP', 5000, 'platinum', 'collection', 'XP'),
    halfway_there: metric('earnedBelts', 6, 'grade', 'grades', 'recorded gradings'),
    speed_demon: { tier: 'special', category: 'quiz' },
    night_owl: { tier: 'special', category: 'practice' },
    early_bird: { tier: 'special', category: 'practice' },
    weekend_warrior: { tier: 'special', category: 'practice' },
  };
  ['red_belt', 'yellow_belt', 'orange_belt', 'green_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'brown_white_belt', 'brown_black_belt', 'shodan', 'nidan', 'sandan', 'green_belt_journey', 'brown_belt_journey'].forEach(id => {
    legacy[id] = { tier: 'grade', category: 'grades' };
  });

  const additions = [
    ['technique_five', 'Finding Your Feet', 'Mark 5 techniques as learned', 'techniquesLearned', 5, 'bronze', 'syllabus', 'techniques', 30],
    ['technique_ten', 'Building Blocks', 'Mark 10 techniques as learned', 'techniquesLearned', 10, 'bronze', 'syllabus', 'techniques', 40],
    ['technique_twenty_five', 'Strong Foundations', 'Mark 25 techniques as learned', 'techniquesLearned', 25, 'silver', 'syllabus', 'techniques', 60],
    ['technique_seventy_five', 'Broadening Your Practice', 'Mark 75 techniques as learned', 'techniquesLearned', 75, 'gold', 'syllabus', 'techniques', 120],
    ['technique_one_twenty_five', 'The Long Journey', 'Mark 125 techniques as learned', 'techniquesLearned', 125, 'elite', 'syllabus', 'techniques', 400],
    ['quiz_first', 'First Round', 'Complete your first quiz', 'quizzesCompleted', 1, 'bronze', 'quiz', 'quizzes', 20],
    ['quiz_five', 'Back for More', 'Complete 5 quizzes', 'quizzesCompleted', 5, 'bronze', 'quiz', 'quizzes', 35],
    ['quiz_two_fifty', 'Long Game', 'Complete 250 quizzes', 'quizzesCompleted', 250, 'platinum', 'quiz', 'quizzes', 400],
    ['quiz_five_hundred', 'A Practice for Life', 'Complete 500 quizzes', 'quizzesCompleted', 500, 'elite', 'quiz', 'quizzes', 750],
    ['perfect_three', 'Clean Rounds', 'Score 100% on 3 quizzes', 'perfectQuizzes', 3, 'silver', 'quiz', 'perfect quizzes', 60],
    ['perfect_twenty_five', 'Precision Practice', 'Score 100% on 25 quizzes', 'perfectQuizzes', 25, 'platinum', 'quiz', 'perfect quizzes', 300],
    ['perfect_fifty', 'No Loose Ends', 'Score 100% on 50 quizzes', 'perfectQuizzes', 50, 'platinum', 'quiz', 'perfect quizzes', 450],
    ['perfect_hundred', 'The Hundred Club', 'Score 100% on 100 quizzes', 'perfectQuizzes', 100, 'elite', 'quiz', 'perfect quizzes', 800],
    ['answers_two_fifty', 'A Growing Vocabulary', 'Answer 250 quiz questions correctly', 'correctAnswers', 250, 'silver', 'quiz', 'correct answers', 100],
    ['answers_two_thousand_five_hundred', 'Deep Recall', 'Answer 2,500 quiz questions correctly', 'correctAnswers', 2500, 'platinum', 'quiz', 'correct answers', 500],
    ['answers_five_thousand', 'The Long View', 'Answer 5,000 quiz questions correctly', 'correctAnswers', 5000, 'elite', 'quiz', 'correct answers', 1000],
    ['answer_streak_twenty_five', 'Clear Focus', 'Get 25 correct answers in a row across quizzes', 'bestStreak', 25, 'gold', 'quiz', 'correct in a row', 200],
    ['answer_streak_fifty', 'Unbroken Focus', 'Get 50 correct answers in a row across quizzes', 'bestStreak', 50, 'platinum', 'quiz', 'correct in a row', 400],
    ['answer_streak_hundred', 'Absolute Focus', 'Get 100 correct answers in a row across quizzes', 'bestStreak', 100, 'elite', 'quiz', 'correct in a row', 800],
    ['daily_first', 'Today Counts', 'Complete your first daily challenge', 'dailyChallengesCompleted', 1, 'bronze', 'practice', 'daily challenges', 20],
    ['daily_fourteen', 'A Fortnight of Challenges', 'Complete 14 daily challenges; they need not be consecutive', 'dailyChallengesCompleted', 14, 'silver', 'practice', 'daily challenges', 150],
    ['daily_sixty', 'Keep Showing Up', 'Complete 60 daily challenges; they need not be consecutive', 'dailyChallengesCompleted', 60, 'platinum', 'practice', 'daily challenges', 400],
    ['daily_hundred', 'One Hundred Days', 'Complete 100 daily challenges; they need not be consecutive', 'dailyChallengesCompleted', 100, 'platinum', 'practice', 'daily challenges', 600],
    ['daily_one_eighty', 'Steady Commitment', 'Complete 180 daily challenges; they need not be consecutive', 'dailyChallengesCompleted', 180, 'elite', 'practice', 'daily challenges', 1000],
    ['weak_first', 'Face the Challenge', 'Complete your first Weak Spots quiz', 'weakSpotsQuizzesCompleted', 1, 'bronze', 'study', 'weak-spots quizzes', 25],
    ['weak_fifteen', 'Work on What Matters', 'Complete 15 Weak Spots quizzes', 'weakSpotsQuizzesCompleted', 15, 'gold', 'study', 'weak-spots quizzes', 150],
    ['weak_thirty', 'Leave No Gaps', 'Complete 30 Weak Spots quizzes', 'weakSpotsQuizzesCompleted', 30, 'platinum', 'study', 'weak-spots quizzes', 300],
    ['study_three', 'Branching Out', 'Open 3 different categories in Focus Mode', 'categoriesStudied', 3, 'bronze', 'study', 'categories', 25],
    ['study_five', 'A Wider View', 'Open 5 different categories in Focus Mode', 'categoriesStudied', 5, 'silver', 'study', 'categories', 50],
    ['study_ten', 'Ten Directions', 'Open 10 different categories in Focus Mode', 'categoriesStudied', 10, 'gold', 'study', 'categories', 125],
    ['perfect_run_five', 'Five Without Fault', 'Complete 5 perfect quizzes in a row', 'bestConsecutivePerfect', 5, 'platinum', 'quiz', 'perfect quizzes in a row', 300],
    ['perfect_run_ten', 'Ten Without Fault', 'Complete 10 perfect quizzes in a row', 'bestConsecutivePerfect', 10, 'elite', 'quiz', 'perfect quizzes in a row', 600],
    ['practice_sixty', 'A Steady Rhythm', 'Complete app practice on 60 consecutive days', 'practiceStreak', 60, 'platinum', 'practice', 'consecutive days', 650],
    ['practice_ninety', 'A Lasting Habit', 'Complete app practice on 90 consecutive days', 'practiceStreak', 90, 'elite', 'practice', 'consecutive days', 1000],
  ];
  const additionalBadges = additions.map(([id, name, description, stat, target, tier, category, unit, xp]) => ({
    id, name, description, xp, icon: '◆', ...metric(stat, target, tier, category, unit),
    check: stats => count(stats[stat]) >= target,
  }));
  const describe = badge => legacy[badge.id] || badge;

  function renderBadge(badge, stats) {
    const meta = describe(badge);
    const tier = tiers[meta.tier] || tiers.special;
    const earned = (stats.unlockedBadges || []).includes(badge.id);
    const raw = Array.isArray(stats[meta.stat]) ? stats[meta.stat].length : stats[meta.stat];
    const current = meta.stat === 'allTechniquesLearned' ? Number(!!raw) : count(raw);
    const target = meta.target || 0;
    const value = earned ? target : Math.min(current, target);
    const savedDate = stats.badgeUnlockDates?.[badge.id];
    const date = savedDate ? new Date(savedDate) : null;
    const dateLabel = date && Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const progress = target ? `<div class="member-badge__progress"><progress max="${target}" value="${value}" aria-label="${escape(badge.name)} progress"></progress><span>${value.toLocaleString('en-GB')} / ${target.toLocaleString('en-GB')} ${escape(meta.unit)}</span></div>` : '';
    return `<article class="member-badge" data-earned="${earned}" data-tier="${escape(meta.tier || 'special')}" data-category="${escape(meta.category || 'collection')}">
      <div class="member-badge__top"><span class="member-badge__medal" aria-hidden="true">${icons[meta.category] || icons.collection || '◆'}</span><span class="member-badge__tier">${escape(tier.label)}</span></div>
      <p class="member-badge__category">${escape(categories[meta.category] || 'Collection')}</p>
      <h2>${escape(badge.name)}</h2><p class="member-badge__description">${escape(badge.description)}</p>
      ${progress}<div class="member-badge__footer"><span class="member-badge__xp">${earned ? '+' : ''}${count(badge.xp)} XP</span><span class="member-badge__status">${earned ? 'Earned' : 'To earn'}</span></div>
      ${dateLabel ? `<p class="member-badge__date">Earned ${escape(dateLabel)}</p>` : ''}
    </article>`;
  }
  window.hakubaAchievementCatalogue = { additionalBadges, tiers, describe, renderBadge };
})();
