import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "@/theme/AppTheme";
import ColorModeSelect from "@/theme/ColorModeSelect";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

import {
  GoogleIcon,
  // FacebookIcon,
  SitemarkIcon,
} from "@/components/Login/CustomIcons";

const supabase = createPagesBrowserClient();

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    zIndex: -1,
    backgroundColor: "#ff99ad",
    backgroundImage: `
      background-color:#cf99ff;
background-image:
radial-gradient(at 12% 53%, hsla(172,99%,61%,1) 0px, transparent 50%),
radial-gradient(at 66% 30%, hsla(253,72%,62%,1) 0px, transparent 50%),
radial-gradient(at 43% 52%, hsla(196,84%,77%,1) 0px, transparent 50%),
radial-gradient(at 15% 87%, hsla(202,94%,63%,1) 0px, transparent 50%),
radial-gradient(at 52% 8%, hsla(297,84%,62%,1) 0px, transparent 50%),
radial-gradient(at 61% 93%, hsla(268,86%,61%,1) 0px, transparent 50%),
radial-gradient(at 33% 33%, hsla(116,91%,73%,1) 0px, transparent 50%);
    `,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    clipPath: "polygon(0 0, 100% 0, 100% 40%, 0% 70%)", // 👈 più alta e visibile
    ...theme.applyStyles("dark", {
      filter: "brightness(0.5) blur(4px)",
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [useMagicLink, setUseMagicLink] = React.useState(true);
  const [submitMessage, setSubmitMessage] = React.useState("");

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email")) {
        setEmailError(true);
        setEmailErrorMessage(error.message);
      } else {
        setPasswordError(true);
        setPasswordErrorMessage(error.message);
      }
      return;
    }

    console.log("✅ Login successful:", data);
    setSubmitMessage("✅ Login successful.");
  };
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleMagicLinkLogin = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // personalizza se necessario
      },
    });

    if (error) {
      setEmailError(true);
      setEmailErrorMessage(error.message);
      return;
    }

    setSubmitMessage("✅ A sign-in link has been sent to your email.");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!validateInputs()) return;

    if (useMagicLink) {
      await handleMagicLinkLogin(email);
    } else {
      await handleLogin(email, password);
    }

    formRef.current?.reset(); // ✅ nessun errore se il form non esiste
    setEmailError(false);
    setPasswordError(false);
    setEmailErrorMessage("");
    setPasswordErrorMessage("");
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!useMagicLink && (!password.value || password.value.length < 6)) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            ref={formRef}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
              />
            </FormControl>

            {!useMagicLink && (
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                />
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={useMagicLink}
                  onChange={() => setUseMagicLink(!useMagicLink)}
                  color="primary"
                />
              }
              label="Sign in with magic link"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign in
            </Button>

            {submitMessage && (
              <Typography
                variant="body2"
                color="success.main"
                textAlign="center"
              >
                {submitMessage}
              </Typography>
            )}
          </Box>

          <Divider>or</Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Google")}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>

            {/* Facebook login rimosso */}
            {/* <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Facebook")}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button> */}

            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/material-ui/getting-started/templates/sign-in/"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
