import { LucideIcon } from "lucide-react";

export type ClientPage = "createPost" | "myPosts" | "searchHelpers" | "mapView" | "profile";
export type HelperPage = "profile" | "tasks" | "apps" | "mapView" | "leaderboard";
export type Page = ClientPage | HelperPage;
export type NavSidebarRoute = {
  title: string;
  page: ClientPage | HelperPage;
  icon: LucideIcon;
  hoverText: string;
};

function makePageParser<T extends string>(allowed: readonly T[], fallback: T) {
  const set = new Set(allowed);
  return (input: string): T => (set.has(input as T) ? (input as T) : fallback);
}

// handy helper functions that assign a default page when given input does not match any given page above
export const parseClientPage = makePageParser<ClientPage>(
  ["createPost", "myPosts", "searchHelpers", "profile"] as const,
  "profile",
);

export const parseHelperPage = makePageParser<HelperPage>(
  ["profile", "tasks", "apps"] as const,
  "profile",
);
