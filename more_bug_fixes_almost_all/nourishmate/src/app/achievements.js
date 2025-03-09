// Central file for all achievements
export const ACHIEVEMENTS = {
  streakAchievements: [
    {
      id: "first_entry",
      name: "First Entry",
      requirement: 1,
      description: "Logged your first weight entry!",
      icon: "🏆", // You can use emojis or image paths
    },
    {
      id: "week_warrior",
      name: "Week Warrior",
      requirement: 7,
      description: "Maintained a 7-day streak!",
      icon: "📅",
    },
    {
      id: "consistent_tracker",
      name: "Consistent Tracker",
      requirement: 14,
      description: "Kept tracking for 14 days!",
      icon: "📊",
    },
    {
      id: "monthly_master",
      name: "Monthly Master",
      requirement: 30,
      description: "Amazing! A whole month of tracking!",
      icon: "🔄",
    },
    {
      id: "quarterly_champion",
      name: "Quarterly Champion",
      requirement: 90,
      description: "90 days of dedication!",
      icon: "🌟",
    },
    {
      id: "yearly_legend",
      name: "Yearly Legend",
      requirement: 365,
      description: "A full year of commitment!",
      icon: "👑",
    },
  ],

  // Add new achievement types here
  weightGoalsAchievements: [
    {
      id: "weight_goal_first",
      name: "First Goal",
      description: "Reached your first weight goal!",
      icon: "⚖️",
    },
    {
      id: "weight_goal_five",
      name: "Goal Crusher",
      description: "Reached your fifth weight goal!",
      icon: "💪",
    },
  ],

  mealAchievements: [
    {
      id: "meal_track_first",
      name: "First Meal",
      description: "Tracked your first meal!",
      icon: "🍽️",
    },
    {
      id: "meal_track_fifty",
      name: "Food Logger",
      description: "Tracked 50 meals!",
      icon: "📝",
    },
  ],
};
