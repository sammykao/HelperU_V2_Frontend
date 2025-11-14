import { LucideIcon } from "lucide-react";

export type ClientPage = "createPost" | "myPosts" | "searchHelpers" | "mapView" | "profile";
export type HelperPage = "profile" | "tasks" | "apps" | "mapView" | "leaderboard";
export type Page = ClientPage | HelperPage;
export type NavSidebarRoute = {
  title: string;
  page: ClientPage | HelperPage;
  icon: LucideIcon;
};
