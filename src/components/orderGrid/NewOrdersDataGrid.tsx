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
import { OrderTableStatus } from "@/types/enums/enums";
import { OrdersSB } from "@/types/supabase/orders";
import { SendOrdersButton } from "./SendOrdersButton";

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
    renderCell: (params) => {
      const addr = params.value;
      if (!addr || addr.length < 8) return addr;
      const mid = Math.floor(addr.length / 2);
      return "..." + addr.slice(mid);
    },
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
    field: "pre_order_amount",
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
 * 2. Utility helpers        *
 *───────────────────────────*/
const groupByDate = (orders: OrdersSB[]) =>
  orders.reduce((acc, o) => {
    const key = o.modified_at
      ? new Date(o.modified_at).toLocaleDateString("it-IT")
      : "Data sconosciuta";
    (acc[key] ||= []).push(o);
    return acc;
  }, {} as Record<string, OrdersSB[]>);

const sumAmount = (rows: OrdersSB[]) =>
  rows.reduce((s, r) => s + (r.pre_order_amount || 0), 0);

const sumSelected = (rows: OrdersSB[], model?: GridRowSelectionModel) => {
  if (
    !model ||
    model.type !== "include" ||
    !model.ids ||
    !(model.ids instanceof Set)
  ) {
    return 0;
  }

  return rows
    .filter((r) => model.ids.has(String(r.order_id)))
    .reduce((s, r) => s + (r.pre_order_amount || 0), 0);
};

/*───────────────────────────*
 * 3. Main component         *
 *───────────────────────────*/
export default function NewOrdersDataGrid() {
  const { orders, loading, error } = useOrdersNoQuery();
  const [isClient, setIsClient] = React.useState(false);
  const [selected, setSelected] = React.useState<
    Record<string, GridRowSelectionModel>
  >({});

  React.useEffect(() => setIsClient(true), []);

  const grouped = React.useMemo(() => {
    const createdOnly = orders.filter(
      (o) => o.status === OrderTableStatus.PREORDER_PLACED.value
    );
    return groupByDate(createdOnly);
  }, [orders]);

  const handleSelectionChange =
    (date: string) => (model: GridRowSelectionModel) => {
      console.debug(`[DEBUG] Saving selection for ${date}:`, model);
      setSelected((prev) => ({ ...prev, [date]: model }));
    };

  const sumSelected = (rows: OrdersSB[], model?: GridRowSelectionModel) => {
    if (!model || model.type !== "include" || !(model.ids instanceof Set))
      return 0;
    return rows
      .filter((r) => model.ids.has(String(r.order_id)))
      .reduce((s, r) => s + (r.pre_order_amount || 0), 0);
  };

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
        const model = selected[date];

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
                  getRowId={(r) => String(r.order_id)}
                  autoHeight
                  checkboxSelection
                  disableRowSelectionOnClick
                  rowSelectionModel={model}
                  onRowSelectionModelChange={handleSelectionChange(date)}
                  sx={{
                    ".MuiDataGrid-cell": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                  slots={{ columnMenu: CustomColumnMenu }}
                />
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="light"
                    sx={{
                      fontWeight: "bold",
                      fontSize: ".8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Total Selected: ${sumSelected(rows, model).toFixed(2)}
                  </Typography>

                  {model?.type === "include" && model.ids.size > 0 && (
                    <SendOrdersButton selectedOrders={selected} />
                  )}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
