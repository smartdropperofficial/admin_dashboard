import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useOrdersNoQuery } from "@/hooks/useOrdersNoQuery";
import type { OrderSB } from "@/types/supabase/orders";

export default function NewOrdersDataGrid() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { orders, loading, error } = useOrdersNoQuery();

  const groupedOrders = React.useMemo(() => {
    return orders.reduce((acc, order) => {
      const date = order.modified_at
        ? new Date(order.modified_at).toLocaleDateString("it-IT")
        : "Data sconosciuta";
      if (!acc[date]) acc[date] = [];
      acc[date].push(order);
      return acc;
    }, {} as Record<string, OrderSB[]>);
  }, [orders]);

  const columns: GridColDef[] = [
    {
      field: "order_id",
      headerName: "Order ID",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "wallet_address",
      headerName: "Wallet Address",
      flex: 2,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "total_amount_paid",
      headerName: "Total Paid",
      type: "number",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) =>
        `$${Number(params?.value || 0).toFixed(2)}`,
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params: any) => {
        console.log("🚀 ~ NewOrdersDataGrid ~ params:", params);
        const date = new Date(params);
        return date.toLocaleDateString();
      },
    },

    {
      field: "payment_tx",
      headerName: "Payment TX",
      flex: 2,
      minWidth: 180,
    },
  ];

  if (!isClient || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error loading orders</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {Object.entries(groupedOrders).map(([date, rows]) => {
        const totalAmount = rows.reduce(
          (sum, r) => sum + (r.total_amount_paid || 0),
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
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  autoHeight
                  disableRowSelectionOnClick
                  sx={{
                    ".MuiDataGrid-cell": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
