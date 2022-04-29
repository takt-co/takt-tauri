import React, { useState } from "react";
import { useAuthentication } from "./providers/Authentication";
import { Column, Row } from "./components/Flex";
import { Text } from "./components/Typography";
import { IconButton, InputAdornment, TextField, useTheme } from "@mui/material";
import { Button } from "./components/Button";
import LogoSrc from "./assets/logo.png";
import { LoginIcon, PasswordHidden, PasswordShowing } from "./components/Icons";
import { Spacer } from "./components/Spacer";
import { Layout } from "./components/Layout";
import { useSnacks } from "./providers/Snacks";

export const Unauthenticated = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "unauthenticated") {
    throw new Error("Rendered AuthScreen while already authenticated");
  }

  const theme = useTheme();
  const snacks = useSnacks();

  const [showingPassword, setShowingPassword] = useState(false);
  const [inFlight, setInFlight] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });

  const handleLogin = () => {
    setInFlight(true);
    authentication.login(loginDetails).then((success) => {
      setInFlight(false);
      if (!success) {
        snacks.alert({
          severity: "error",
          title: "Login failed",
        });
      }
    });
  };

  return (
    <Layout>
      <Layout.TopBar>
        <Row padding="smaller">
          <img alt="Takt" src={LogoSrc} height={20} />
        </Row>
      </Layout.TopBar>
      <Column
        fullWidth
        fullHeight
        padding="large"
        alignItems="flex-start"
        justifyContent="center"
        gap="small"
        style={{ background: "white" }}
      >
        <Column>
          <Text fontSize="large" strong>
            👋 Hello, there.
          </Text>
          <Spacer size="smaller" />
          <Text fontSize="detail" color={theme.palette.grey[600]}>
            Please login using the form below
          </Text>
          <Spacer size="tiny" />
        </Column>
        <TextField
          label="Username"
          fullWidth
          autoFocus
          autoCapitalize="false"
          value={loginDetails.username}
          sx={{ root: { borderRadius: 0 } }}
          onChange={(ev) => {
            setLoginDetails((deets) => ({
              ...deets,
              username: ev.target.value,
            }));
          }}
        />
        <TextField
          label="Password"
          autoCapitalize="false"
          type={showingPassword ? "text" : "password"}
          value={loginDetails.password}
          sx={{ root: { borderRadius: 0 } }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              handleLogin();
            }
          }}
          onSubmit={handleLogin}
          onChange={(ev) => {
            setLoginDetails((deets) => ({
              ...deets,
              password: ev.target.value,
            }));
          }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setShowingPassword((a) => !a);
                  }}
                >
                  {showingPassword ? (
                    <PasswordShowing
                      width={20}
                      fill={theme.palette.primary.main}
                    />
                  ) : (
                    <PasswordHidden
                      width={20}
                      fill={theme.palette.primary.main}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Row>
          <Button
            variant="outlined"
            loading={inFlight}
            startIcon={
              <LoginIcon
                width={12}
                height={12}
                fill={theme.palette.primary.main}
              />
            }
            onClick={handleLogin}
          >
            Login
          </Button>
        </Row>
      </Column>
    </Layout>
  );
};
