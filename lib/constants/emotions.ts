import type { EmotionalState } from "@/lib/types/trade";

export interface EmotionOption {
  value: EmotionalState;
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: EmotionOption[] = [
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "confident", label: "Confident", emoji: "💪", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  { value: "excited", label: "Excited", emoji: "🤩", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "fearful", label: "Fearful", emoji: "😨", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "greedy", label: "Greedy", emoji: "🤑", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "frustrated", label: "Frustrated", emoji: "😤", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
];
