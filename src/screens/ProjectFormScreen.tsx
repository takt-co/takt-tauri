import React, { useState } from "react";
import { TextField } from "@mui/material";
import { graphql } from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { Column } from "../components/Flex";
import { Spacer } from "../components/Spacer";
import { Text } from "../components/Typography";
import { ID } from "../CustomTypes";
import { ProjectFormScreenQuery } from "./__generated__/ProjectFormScreenQuery.graphql";
import { Button } from "../components/Button";
import { ButtonBar } from "../components/ButtonBar";
import { useAppState } from "../providers/AppState";

export const ProjectFormScreen = ({
  defaultValues,
}: {
  defaultValues: {
    projectId?: ID;
    name: string;
  };
}) => {
  const { setAppState } = useAppState();
  const [attributes, setAttributes] = useState(defaultValues);

  return (
    <Column fullHeight style={{ background: "white" }}>
      <Column fullHeight justifyContent="space-around" padding="small">
        <Text fontSize="large" strong>
          {defaultValues.projectId ? "Edit" : "Add"} project
        </Text>

        <Spacer size="medium" vertical />

        <Column fullHeight justifyContent="space-between">
          <TextField
            fullWidth
            autoFocus
            size="small"
            label="Project name"
            value={attributes.name}
            onChange={(ev) => {
              setAttributes({ name: ev.target.value });
            }}
          />
        </Column>
      </Column>

      <ButtonBar>
        <Button
          size="small"
          onClick={() => {
            setAppState(s => ({ ...s, tag: "projects" }));
          }}>
          Cancel
        </Button>

        <Button variant="contained" disableElevation size="small">
          {defaultValues.projectId ? "Update" : "Create"} project
        </Button>
      </ButtonBar>
    </Column>
  );
};

export const EditProjectFormScreen = ({ projectId }: { projectId: ID }) => {
  const { node: project } = useLazyLoadQuery<ProjectFormScreenQuery>(
    graphql`
      query ProjectFormScreenQuery($projectId: ID!) {
        node(id: $projectId) {
          __typename
          ... on Project {
            id
            name
          }
        }
      }
    `,
    {
      projectId,
    }
  );

  if (project?.__typename !== "Project") {
    throw new Error(
      `EditProjectFormScreen: expected Project, got ${JSON.stringify(project)}`
    );
  }

  return <ProjectFormScreen defaultValues={{ projectId: project.id, name: project.name }} />;
};
