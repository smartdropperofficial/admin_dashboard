import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SelectContent from "./SelectContent";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import CustomizedTreeView, { CustomItem } from "./CustomizedTreeView";
import { useRouter } from "next/router";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

const treeItems: CustomItem[] = [
  {
    id: "1",
    label: "Home",
    link: "/",
  },
  {
    id: "2",
    label: "Blog",
    children: [{ id: "2.1", label: "Post 1", link: "/blog/1", color: "green" }],
  },
];

export default function SideMenu() {
  const router = useRouter();
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header (select + divider) */}
      <Box sx={{ mt: "calc(var(--template-frame-height, 0px) + 4px)", p: 1.5 }}>
        <SelectContent />
      </Box>
      <Divider />

      {/* Main content (scrollable center) */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />

        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
          <CustomizedTreeView
            title="Navigazione"
            items={treeItems}
            defaultExpanded={["2"]}
            onLinkClick={(link) => router.push(link)} // oppure window.open(link)
          />
        </Box>

        <CardAlert />
      </Box>

      {/* Footer: avatar + nome */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt="Riley Carter"
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            Riley Carter
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            riley@email.com
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
