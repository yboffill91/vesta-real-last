"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      className="flex items-center  rounded "
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" && (
        <Sun
          className=" transition-opacity duration-300 size-4"
          style={{ opacity: theme === "dark" ? 0.5 : 1 }}
        />
      )}

      {theme === "light" && (
        <Moon
          className=" transition-opacity duration-300 size-4"
          style={{ opacity: theme === "light" ? 0.5 : 1 }}
        />
      )}
      {theme === "system" && (
        <SunMoon
          className="transition-opacity duration-300 size-4"
          style={{
            opacity: theme === "system" ? 0.5 : 1,
          }}
        />
      )}
    </Button>
  );
}
