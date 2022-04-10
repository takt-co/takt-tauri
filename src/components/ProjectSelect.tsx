import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { graphql } from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { ID, NonNull } from "../CustomTypes";
import { ProjectSelect_Query } from "./__generated__/ProjectSelect_Query.graphql";

type ProjectSelectOption = NonNull<ProjectSelect_Query["response"]["currentUser"]["projects"]["edges"][number]["node"]>;

export const ProjectSelect = (props: { value: ID; onChange: (value: ID) => void }) => {
  const data = useLazyLoadQuery<ProjectSelect_Query>(
    graphql`
      query ProjectSelect_Query {
        currentUser {
          id
          projects {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
    {}
  );

  const projects = data.currentUser.projects.edges
    .map((e) => e.node)
    .filter(Boolean) as ReadonlyArray<ProjectSelectOption>;

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Project</InputLabel>
      <Select
        value={props.value}
        size="small"
        label="Project"
        onChange={(ev) => {
          props.onChange(ev.target.value);
        }}
      >
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
