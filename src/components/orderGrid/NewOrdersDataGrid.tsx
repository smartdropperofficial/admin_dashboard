import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// Simulated order data
const orders = [
  {
    id: 1,
    order_id: "A1",
    wallet_address: "0xabc123",
    status: "paid",
    total_amount_paid: 120.5,
    modified_at: "2025-07-14T10:34:00Z",
    payment_tx: "0xtx1",
  },
  {
    id: 2,
    order_id: "A2",
    wallet_address: "0xdef456",
    status: "pending",
    total_amount_paid: 80.0,
    modified_at: "2025-07-14T12:20:00Z",
    payment_tx: "0xtx2",
  },
  {
    id: 3,
    order_id: "A3",
    wallet_address: "0xabc123",
    status: "paid",
    total_amount_paid: 150.75,
    modified_at: "2025-07-13T09:10:00Z",
    payment_tx: "0xtx3",
  },
  {
    id: 4,
    order_id: "A4",
    wallet_address: "0xxyz789",
    status: "failed",
    total_amount_paid: 0.0,
    modified_at: "2025-07-13T16:45:00Z",
    payment_tx: "0xtx4",
  },
  {
    id: 5,
    order_id: "A5",
    wallet_address: "0xdef456",
    status: "paid",
    total_amount_paid: 200.0,
    modified_at: "2025-07-12T08:00:00Z",
    payment_tx: "0xtx5",
  },
];

// Define columns for DataGrid
const columns: GridColDef[] = [
  { field: "order_id", headerName: "Order ID", width: 100 },
  { field: "wallet_address", headerName: "Wallet Address", width: 180 },
  { field: "status", headerName: "Status", width: 100 },
  {
    field: "total_amount_paid",
    headerName: "Total Paid",
    width: 120,
    type: "number",
    valueFormatter: (params: any) =>
      `$${Number(params?.value || 0).toFixed(2)}`,
  },
  {
    field: "modified_at",
    headerName: "Modified At",
    width: 180,
    valueFormatter: (params: any) =>
      new Date(String(params?.value)).toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  { field: "payment_tx", headerName: "Payment TX", width: 200 },
];

// Group orders by date (dd/mm/yyyy)
const groupByDate = orders.reduce((acc, order) => {
  const date = new Date(order.modified_at).toLocaleDateString("it-IT");
  if (!acc[date]) acc[date] = [];
  acc[date].push(order);
  return acc;
}, {} as Record<string, typeof orders>);

export default function GroupedAccordionOrders() {
  return (
    <Box sx={{ width: "100%" }}>
      {Object.entries(groupByDate).map(([date, rows]) => {
        const totalAmount = rows.reduce(
          (sum, r) => sum + r.total_amount_paid,
          0
        );
        return (
          <Accordion key={date} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "bold" }}>
                📅 {date} — 🧾 {rows.length} Orders — 💰 $
                {totalAmount.toFixed(2)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  hideFooter
                  disableRowSelectionOnClick
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
