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
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useOrdersNoQuery } from "@/hooks/useOrdersNoQuery";
import { CustomColumnMenu } from "./CustomColumnMenu";
import { OrderStatus, OrderTableStatus } from "@/types/enums/enums";
import { OrderSB } from "@/types/supabase/orders";

/*───────────────────────────*
 * 1. Static column schema   *
 *───────────────────────────*/
const columns: GridColDef[] = [
  { field: "order_id", headerName: "Order ID", flex: 1, minWidth: 100 },
  {
    field: "wallet_address",
    headerName: "Wallet Address",
    flex: 2,
    minWidth: 150,
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 100,
    valueGetter: (params) => {
      const status = params;
      const entry = Object.values(OrderTableStatus).find(
        (s) => s.value === status
      );
      return entry?.description || status;
    },
  },

  {
    field: "amount_paid",
    headerName: "Total Paid",
    type: "number",
    flex: 1,
    minWidth: 120,
    valueFormatter: (p) => `$${Number(p || 0).toFixed(2)}`,
  },
  {
    field: "created_at",
    headerName: "Created At",
    width: 180,
    valueFormatter: (p) => new Date(p).toLocaleDateString("it-IT"),
  },
  {
    field: "pre_order_payment_tx",
    headerName: "Payment TX",
    flex: 2,
    minWidth: 180,
    renderCell: (params) => {
      const hash = params.value;
      if (!hash) return "-";
      const url = `https://polygonscan.com/tx/${hash}`;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {hash.slice(0, 6)}...{hash.slice(-4)}
        </a>
      );
    },
  },
];

/*───────────────────────────*
 * 2. Pure utility helpers   *
 *───────────────────────────*/
const groupByDate = (orders: OrderSB[]) =>
  orders.reduce((acc, o) => {
    const key = o.modified_at
      ? new Date(o.modified_at).toLocaleDateString("it-IT")
      : "Data sconosciuta";
    (acc[key] ||= []).push(o);
    return acc;
  }, {} as Record<string, OrderSB[]>);

const sumAmount = (rows: OrderSB[]) =>
  rows.reduce((s, r) => s + (r.total_amount_paid || 0), 0);

const sumSelected = (rows: OrderSB[], ids: (string | number)[]) =>
  rows
    .filter((r) => ids.includes(r.order_id!))
    .reduce((s, r) => s + (r.total_amount_paid || 0), 0);

/*───────────────────────────*
 * 3. Main component         *
 *───────────────────────────*/
export default function NewOrdersDataGrid() {
  /* Hooks — chiamati sempre allo stesso ordine */
  const { orders, loading, error } = useOrdersNoQuery();
  const [isClient, setIsClient] = React.useState(false);
  const [selected, setSelected] = React.useState<
    Record<string, GridRowSelectionModel>
  >({});

  /* Effetti */
  React.useEffect(() => setIsClient(true), []);

  /* Memo — dipende solo da orders */
  /* Effetti */
  React.useEffect(() => setIsClient(true), []);

  /* Memo — filtra e raggruppa solo PREORDER_PLACED */
  const grouped = React.useMemo(() => {
    console.debug("[DEBUG] Raw orders received:", orders);

    const createdOnly = orders.filter(
      (o) => o.status === OrderTableStatus.PREORDER_PLACED.value
    );

    console.debug(
      "[DEBUG] Orders with status === PREORDER_PLACED:",
      createdOnly
    );

    const groupedResult = groupByDate(createdOnly);

    console.debug("[DEBUG] Grouped orders by date:", groupedResult);

    return groupedResult;
  }, [orders]);

  /*──────────────────────────*
   * 4. Render (solo JSX)     *
   *──────────────────────────*/
  if (!isClient || loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Typography color="error">Error loading orders</Typography>;

  return (
    <Box sx={{ width: "100%" }}>
      {Object.entries(grouped).map(([date, rows]) => {
        console.debug(
          "[DEBUG] Rendering grouped entries:",
          Object.entries(grouped)
        );

        const ids = Array.isArray(selected[date]) ? selected[date] : [];
        return (
          <Accordion key={date} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">
                📅 {date} — 🧾 {rows.length} Orders — 💰 $
                {sumAmount(rows).toFixed(2)}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(r) => r.order_id}
                  autoHeight
                  checkboxSelection
                  disableRowSelectionOnClick
                  slots={{
                    columnMenu: CustomColumnMenu, // 👉 qui lo attivi
                  }}
                  onRowSelectionModelChange={(sel) =>
                    setSelected((prev) => ({ ...prev, [date]: sel }))
                  }
                  sx={{
                    ".MuiDataGrid-cell": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />

                <Box sx={{ mt: 1, textAlign: "right" }}>
                  <Typography variant="body2" color="primary">
                    ✅ Selected Total for {date}: $
                    {sumSelected(rows, ids).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
