import React, { useState } from "react";
import { useAuthentication } from "./providers/Authentication";
import { Column, Row } from "./components/Flex";
import { TopBar } from "./components/TopBar";
import { Text } from "./components/Typography";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Button } from "./components/Button";
import LogoSrc from "./assets/logo.png";
import { LoginIcon, PasswordHidden, PasswordShowing } from "./components/Icons";
import { colors } from "./TaktTheme";
import { Spacer } from "./components/Spacer";

export const Unauthenticated = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "unauthenticated") {
    throw new Error("Rendered AuthScreen while already authenticated");
  }

  const [showingPassword, setShowingPassword] = useState(false);
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const [inFlight, setInFlight] = useState(false);

  const handleLogin = () => {
    setInFlight(true);
    authentication.login(loginDetails).then(() => {
      setInFlight(false);
    });
  };

  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      fullWidth
      fullHeight
      style={{ borderRadius: 5, height: "100vh" }}
    >
      <TopBar
        left={
          <Row padding="smaller">
            <img alt="Takt" src={LogoSrc} height={20} />
          </Row>
        }
      />
      <Column
        fullWidth
        padding="large"
        backgroundColor="white"
        alignItems="flex-start"
        justifyContent="center"
        gap="small"
        style={{ borderRadius: "0 0 5px 5px", height: "calc(100vh - 65px)" }}
      >
        <Column>
          <Text fontSize="large" strong>
            👋 Hello, there.
          </Text>
          <Spacer size="smaller" />
          <Text fontSize="detail" color={colors.darkGray}>
            Please login using the form below
          </Text>
          <Spacer size="tiny" />
        </Column>
        <TextField
          label="Username"
          fullWidth
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
                    <PasswordShowing width={20} />
                  ) : (
                    <PasswordHidden width={20} />
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
              <LoginIcon width={12} height={12} fill={colors.primary} />
            }
            onClick={handleLogin}
          >
            Login
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
