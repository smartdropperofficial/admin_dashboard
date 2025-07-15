import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import { inputsCustomizations } from "./customizations/inputs";
import { dataDisplayCustomizations } from "./customizations/dataDisplay";
import { feedbackCustomizations } from "./customizations/feedback";
import { navigationCustomizations } from "./customizations/navigation";
import { surfacesCustomizations } from "./customizations/surfaces";
import { colorSchemes, typography, shadows, shape } from "./themePrimitives";

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}
export const ColorModeContext = React.createContext({
  mode: "light",
  setMode: (_: "light" | "dark") => {},
  toggleMode: () => {},
});


export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme(
          {
            cssVariables: {
              colorSchemeSelector: "data-mui-color-scheme",
              cssVarPrefix: "template",
            },
            colorSchemes,
            typography,
            shadows,
            shape,
            components: {
              ...inputsCustomizations,
              ...dataDisplayCustomizations,
              ...feedbackCustomizations,
              ...navigationCustomizations,
              ...surfacesCustomizations,
              ...themeComponents,
            },
          },
          mode
        ); // <- important
  }, [disableCustomTheme, themeComponents, mode]);

  if (disableCustomTheme) {
    return <>{children}</>;
  }  

  return (
    <ColorModeContext.Provider value={{ mode, setMode, toggleMode }}>
      <ThemeProvider theme={theme} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
