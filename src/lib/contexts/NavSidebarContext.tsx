import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { Page, parseClientPage, parseHelperPage } from '@/lib/utils/types';
import { useAuth } from './AuthContext';

interface NavSidebarContextType {
  setPage: Dispatch<SetStateAction<Page>>
  page: Page,
}

interface NavSidebarProviderProps {
  children: ReactNode
}

const NavSidebarContext = createContext<NavSidebarContextType | undefined>(undefined);
const LOCALSTORAGE_NAV_STATE_KEY = "navPage"

export function NavSidebarProvider({ children }: NavSidebarProviderProps) {
  const { authRoute } = useAuth()
  const defaultPage: Page = authRoute === "client" ? "myPosts" : "tasks"
  const [page, setPage] = useState<Page>(defaultPage);

  // used to avoid race conditions on initial render for page set
  const [hydrated, setHydrated] = useState(false);

  // set the initial page to cached state (is possible)
  useEffect(() => {
    if (!authRoute) return;

    const key = LOCALSTORAGE_NAV_STATE_KEY;
    const raw = localStorage.getItem(key);

    const parsed =
      authRoute === "client"
        ? parseClientPage(raw ?? "")
        : parseHelperPage(raw ?? "");

    setPage(parsed);

    // signify that initial rendering ran so updates don't conflict later
    setHydrated(true);
  }, [authRoute]);

  // cache the most recent page state
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(LOCALSTORAGE_NAV_STATE_KEY, page);
  }, [hydrated, page])

  const navSidebarVals = {
    page,
    setPage
  };

  return (
    <NavSidebarContext.Provider value={navSidebarVals}>
      {children}
    </NavSidebarContext.Provider>
  )
}

export function useNavbar() {
  const ctx = useContext(NavSidebarContext);

  if (!ctx) {
    throw new Error("Cannot call useNavbar without a NavSidebarProvider");
  }

  return ctx;
}
