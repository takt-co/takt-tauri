import React from "react";
import { Column } from "./Flex";
import { TopBar } from "./TopBar";
import { createTeleporter } from "react-teleporter";

export const TopBarLeft = createTeleporter();
export const TopBarRight = createTeleporter();
export const TopBarBelow = createTeleporter();

export const Layout = (props: { children: React.ReactNode }) => {
  return (
    <Column
      style={{
        height: "calc(100vh - 10px)",
        overflow: "hidden",
        borderRadius: 5,
      }}
    >
      <TopBar
        left={<TopBarLeft.Target />}
        right={<TopBarRight.Target />}
        below={<TopBarBelow.Target />}
      />
      {props.children}
    </Column>
  );
};

Layout.TopBarLeft = TopBarLeft.Source;
Layout.TopBarRight = TopBarRight.Source;
Layout.TopBarBelow = TopBarBelow.Source;
