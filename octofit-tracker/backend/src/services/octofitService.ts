import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = (input ?? {}) as Record<string, unknown>;
  const { userId, teamId, type, minutes } = data;
  if (!userId || !teamId || !type || minutes === undefined || minutes === null) {
    throw httpError(400, 'userId, teamId, type, and minutes are required');
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw httpError(400, 'userId and teamId must be valid IDs');
  }
  const minutesNumber = Number(minutes);
  if (!Number.isFinite(minutesNumber) || minutesNumber <= 0) {
    throw httpError(400, 'minutes must be a positive number');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw httpError(404, 'User or team not found');
  }
  const points = minutesNumber;
  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: String(type),
    minutes: minutesNumber,
    points,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const data = (input ?? {}) as Record<string, unknown>;
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw httpError(400, 'Team name is required');
  }
  const members = Array.isArray(data.members) ? data.members : [];
  const team = await Team.create({ name: data.name, mascot: data.mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const activities = await Activity.find().lean();
  const totals = new Map<string, number>();
  for (const activity of activities) {
    const key = activity.team?.toString();
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + (activity.points ?? 0));
  }
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totals.get(team._id.toString()) ?? 0 }))
    .filter((entry) => entry.totalPoints > 0 || true)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .filter((entry, _index, arr) => arr.some((e) => e.totalPoints > 0) ? entry.totalPoints > 0 : true)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const activityFocus: Record<string, string> = {
  run: 'endurance',
  running: 'endurance',
  cycle: 'endurance',
  cycling: 'endurance',
  swim: 'endurance',
  swimming: 'endurance',
  walk: 'endurance',
  walking: 'endurance',
  endurance: 'endurance',
  strength: 'strength',
  weights: 'strength',
  lifting: 'strength',
};

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw httpError(404, 'User not found');
  }
  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const latestType = recent[0]?.type?.toLowerCase();
  const activityFocusValue = latestType ? activityFocus[latestType] : undefined;
  const focus = activityFocusValue ?? user.fitnessGoal;
  const workouts = await Workout.find().lean();
  const sorted = [...workouts].sort((a, b) => {
    const aMatch = a.focus === focus ? 0 : 1;
    const bMatch = b.focus === focus ? 0 : 1;
    return aMatch - bMatch;
  });
  return sorted.map((workout) => ({
    ...workout,
    reason:
      workout.focus === focus
        ? `Recommended because your recent ${latestType ?? 'activity'} activity and your ${focus} goal match this ${workout.focus} workout.`
        : `Added based on your activity history and fitness goal of ${user.fitnessGoal}.`,
  }));
}

export { User };
