import React, { useState } from "react";
import { useAuthentication } from "../providers/Authentication";
import { Column, Row } from "./Flex";
import { TopBar } from "./TopBar";
import { Text } from "./Typography";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Button } from "./Button";
import LogoSrc from "../assets/logo.png";
import { LoginIcon, PasswordHidden, PasswordShowing } from "./Icons";
import { Spacer } from "./Spacer";
import { colors } from "../Theme";

export const AuthScreen = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "unauthenticated") {
    throw new Error("Rendered AuthScreen while already authenticated");
  }

  const [showingPassword, setShowingPassword] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ username: "", password: "" });
  const [inFlight, setInFlight] = useState(false);

  return (
    <Column
      alignItems="center"
      justifyContent="flex-start"
      fullWidth
      fullHeight
      style={{ borderRadius: 5, height: "100vh" }}
    >
      <TopBar />
      <Column fullWidth padding="large" backgroundColor="primary" alignItems="flex-start">
        <img alt="Takt" src={LogoSrc} style={{ height: 30 }} />
        <Text color="white">Please login using the form below:</Text>
        <Spacer size="small" />
      </Column>
      <Column fullWidth fullHeight backgroundColor="white" padding="large" gap="small">
        <TextField
          label="Username"
          fullWidth
          autoCapitalize="false"
          value={loginDetails.username}
          onChange={(ev) => { setLoginDetails(deets => ({ ...deets, username: ev.target.value })) }}
        />
        <TextField
          label="Password"
          autoCapitalize="false"
          type={showingPassword ? "text" : "password"}
          value={loginDetails.password}
          onChange={(ev) => { setLoginDetails(deets => ({ ...deets, password: ev.target.value })) }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => { setShowingPassword(a => !a)}}>
                  {showingPassword ? (
                    <PasswordShowing width={20} />
                  ) : (
                    <PasswordHidden width={20} />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
          />
        <Row>
          <Button
            variant="outlined"
            loading={inFlight}
            startIcon={(
              <LoginIcon width={12} height={12} fill={colors.primary} />
            )}
            onClick={() => {
              setInFlight(true);
              authentication.login(loginDetails).then(() => {
                setInFlight(false);
              });
            }}
          >
            Login
          </Button>
        </Row>
      </Column>
    </Column>
  )
}
