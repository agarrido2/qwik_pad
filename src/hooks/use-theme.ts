import { $ } from "@builder.io/qwik";

export const useTheme = () => {
  const toggle = $(() => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(isDark ? "light" : "dark");
  });

  return { toggle };
};
