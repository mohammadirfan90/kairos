"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Icons } from "../ui/Icons";
import { User } from "@/lib/types";

export interface HeaderProps {
  backHref?: string;
  projectTitle?: string;
  projectVersion?: string;
  projectEnv?: string;
  rightActions?: React.ReactNode;
}

// Client-side memory cache for active user session across route transitions
let cachedUser: User | null = null;
let userFetchPromise: Promise<User | null> | null = null;

export function Header({
  backHref,
  projectTitle,
  projectVersion,
  projectEnv,
  rightActions,
}: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(cachedUser);

  useEffect(() => {
    if (cachedUser) {
      setCurrentUser(cachedUser);
      return;
    }

    if (!userFetchPromise) {
      userFetchPromise = fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            cachedUser = data.data;
            return data.data;
          }
          return null;
        })
        .catch(() => null)
        .finally(() => {
          userFetchPromise = null;
        });
    }

    userFetchPromise.then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      cachedUser = null;
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left Section: Back button + Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="p-1.5 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-sm transition-colors"
              title="Back to Projects"
            >
              <Icons.ArrowLeft size={16} />
            </Link>
          )}

          <Link href="/" className="flex items-center select-none shrink-0" title="KAIROS Home">
            {/* Theme-aware logo: light SVG in light mode, dark SVG in dark mode */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_lightMode.svg"
              alt="KAIROS Logo"
              width={133}
              height={40}
              className="h-10 w-[133px] dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_darkMode.svg"
              alt="KAIROS Logo"
              width={133}
              height={40}
              className="h-10 w-[133px] hidden dark:block"
            />
          </Link>

          {projectTitle && (
            <div className="hidden md:flex items-center gap-2 text-xs font-mono pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-500">/</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                {projectTitle}
              </span>
              {projectVersion && (
                <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-sm text-[10px]">
                  {projectVersion}
                </span>
              )}
              {projectEnv && (
                <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-sm text-[10px] uppercase">
                  {projectEnv}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions + User Profile + Theme Toggle */}
        <div className="flex items-center gap-3">
          {rightActions}

          {currentUser ? (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  {currentUser.role}
                </span>
              </div>
              <div
                className="w-7 h-7 rounded-sm bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-xs font-mono font-bold"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-sm transition-colors text-xs font-mono cursor-pointer"
                title="Sign Out"
              >
                <Icons.LogOut size={14} />
              </button>
            </div>
          ) : null}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
