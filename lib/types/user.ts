export type Plan = "free" | "pro";

export interface Profile {
  id: string;
  email: string;
  display_name?: string | null;
  plan: Plan;
  timezone: string;
  created_at: string;
  updated_at: string;
}
