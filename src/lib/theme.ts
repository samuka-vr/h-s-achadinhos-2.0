export type SiteTheme = {
  primary_color: string;
  primary_dark: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
};

export const DEFAULT_SITE_THEME: SiteTheme = {
  primary_color: "#F2554F",
  primary_dark: "#D92F46",
  accent_color: "#FF7A3D",
  background_color: "#FFF8F5",
  surface_color: "#FFFFFF",
  text_color: "#2B2326",
};

const LEGACY_THEME = {
  primary_color: "#4f46e5",
  primary_dark: "#3730a3",
  accent_color: "#8b5cf6",
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function validColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value.toUpperCase() : fallback;
}

export function resolveSiteTheme(theme: Record<string, unknown> | null | undefined): SiteTheme {
  const source = theme ?? {};
  const usesLegacyDefaults =
    String(source.primary_color ?? "").toLowerCase() === LEGACY_THEME.primary_color &&
    String(source.primary_dark ?? "").toLowerCase() === LEGACY_THEME.primary_dark &&
    String(source.accent_color ?? "").toLowerCase() === LEGACY_THEME.accent_color;

  const normalizedSource = usesLegacyDefaults ? {} : source;

  return {
    primary_color: validColor(normalizedSource.primary_color, DEFAULT_SITE_THEME.primary_color),
    primary_dark: validColor(normalizedSource.primary_dark, DEFAULT_SITE_THEME.primary_dark),
    accent_color: validColor(normalizedSource.accent_color, DEFAULT_SITE_THEME.accent_color),
    background_color: validColor(normalizedSource.background_color, DEFAULT_SITE_THEME.background_color),
    surface_color: validColor(normalizedSource.surface_color, DEFAULT_SITE_THEME.surface_color),
    text_color: validColor(normalizedSource.text_color, DEFAULT_SITE_THEME.text_color),
  };
}
