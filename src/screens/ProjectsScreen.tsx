import React from "react";
import { Column, Row } from "../components/Flex";
import { Text } from "../components/Typography";
import { useAuthentication } from "../providers/Authentication";

export const ProjectsScreen = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  return (
    <Column fullHeight style={{ background: "white" }}>
      <Row padding="small">
        <Text fontSize="large" strong>
          Projects
        </Text>
      </Row>
    </Column>
  );
};
