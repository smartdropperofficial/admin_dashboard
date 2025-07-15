import * as React from "react";
import {
  GridColumnMenuContainer,
  GridColumnMenuProps,
  GridColumnMenuSortItem,
  GridColumnMenuFilterItem,
  GridColumnMenuColumnsItem,
} from "@mui/x-data-grid";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export function CustomColumnMenu(props: GridColumnMenuProps) {
  const { hideMenu, colDef, open } = props;

  const handleSendOrders = (event: React.MouseEvent) => {
    alert(`📤 Sending orders for column: ${colDef.headerName}`);
    hideMenu?.(event); // ✅ passiamo l’evento come richiesto
  };

  return (
    <GridColumnMenuContainer hideMenu={hideMenu} colDef={colDef} open={open}>
      <GridColumnMenuSortItem colDef={colDef} onClick={hideMenu} />
      <GridColumnMenuFilterItem colDef={colDef} onClick={hideMenu} />
      <GridColumnMenuColumnsItem colDef={colDef} onClick={hideMenu} />

      {/* Custom action */}
      <MenuItem onClick={handleSendOrders}>
        <ListItemIcon>
          <SendIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Send Orders</ListItemText>
      </MenuItem>
    </GridColumnMenuContainer>
  );
}
