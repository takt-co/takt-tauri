import React, { Suspense } from "react";
import { graphql } from "babel-plugin-relay/macro";
import { useFragment, useLazyLoadQuery } from "react-relay";
import { Column, Row } from "../components/Flex";
import { LoadingScreen } from "../components/LoadingScreen";
import { Text } from "../components/Typography";
import { useAuthentication } from "../providers/Authentication";
import { ProjectsScreen_ProjectFragment$key } from "./__generated__/ProjectsScreen_ProjectFragment.graphql";
import { ProjectsScreen_ProjectsListQuery } from "./__generated__/ProjectsScreen_ProjectsListQuery.graphql";
import { ButtonBar } from "../components/ButtonBar";
import { Button } from "../components/Button";
import { AddIcon } from "../components/Icons";
import { MenuItem, MenuList, useTheme } from "@mui/material";
import { Spacer, spacing } from "../components/Spacer";
import { useAppState } from "../providers/AppState";

export const ProjectsScreen = () => {
  const authentication = useAuthentication();
  if (authentication.tag !== "authenticated") {
    throw new Error("Rendered SettingsScreen while not authenticated");
  }

  const theme = useTheme();
  const { setAppState } = useAppState();

  return (
    <Column fullHeight style={{ background: "white" }}>
      <Row padding="small">
        <Text fontSize="large" strong>
          Projects
        </Text>
      </Row>

      <Column fullHeight>
        <Suspense fallback={<LoadingScreen />}>
          <ProjectsList />
        </Suspense>
      </Column>

      <ButtonBar>
        <Spacer />
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <AddIcon
              width={12}
              height={12}
              fill={theme.palette.primary.main}
              style={{ marginLeft: 2 }}
            />
          }
          onClick={() => {
            setAppState((s) => ({ ...s, tag: "addingProject" }));
          }}
        >
          Add project
        </Button>
      </ButtonBar>
    </Column>
  );
};

const ProjectsList = () => {
  const data = useLazyLoadQuery<ProjectsScreen_ProjectsListQuery>(
    graphql`
      query ProjectsScreen_ProjectsListQuery {
        currentUser {
          projects(first: 100) {
            edges {
              cursor
              node {
                id
                ...ProjectsScreen_ProjectFragment
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `,
    {}
  );

  return (
    <MenuList>
      {data.currentUser.projects.edges.map(({ node }) =>
        node ? <ProjectCard key={node.id} project={node} /> : null
      )}
    </MenuList>
  );
};

const ProjectCard = (props: {
  project: ProjectsScreen_ProjectFragment$key;
}) => {
  const { setAppState } = useAppState();
  const project = useFragment(
    graphql`
      fragment ProjectsScreen_ProjectFragment on Project {
        id
        name
      }
    `,
    props.project
  );

  return (
    <MenuItem
      sx={{ paddingLeft: `${spacing.medium}px` }}
      onClick={() => {
        setAppState((s) => ({ ...s, tag: "editingProject", project }));
      }}
    >
      {project.name}
    </MenuItem>
  );
};
