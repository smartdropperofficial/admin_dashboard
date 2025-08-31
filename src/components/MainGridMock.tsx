import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Copyright from "../internals/components/Copyright";
import ChartUserByCountry from "./ChartUserByCountry";
import CustomizedTreeView, { CustomItem } from "./CustomizedTreeView";
import CustomizedDataGrid from "./CustomizedDataGrid";
import HighlightedCard from "./HighlightedCard";
import PageViewsBarChart from "./PageViewsBarChart";
import SessionsChart from "./SessionsChart";
import StatCard, { StatCardProps } from "./StatCard";
import NewOrdersDataGrid from "./orderGrid/NewOrdersDataGrid";
import { useRouter } from "next/router";
import DynamicDataGrid from "./orderGrid/DynamicDataGrid";
import { useState, useEffect, useMemo } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { useOrdersNoQuery } from "@/hooks/useOrdersNoQuery";
import { OrderStatus } from "@/types/enums/enums";

// 👈 COLONNE PREDEFINITE PER DIVERSI TIPI DI VISTA
const getColumnsForView = (viewType: string): GridColDef[] => {
  const baseOrderColumns: GridColDef[] = [
    {
      field: "order_id",
      headerName: "Order ID",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "wallet_address",
      headerName: "Wallet",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.9em" }}>
          {params.value
            ? `${params.value.slice(0, 8)}...${params.value.slice(-4)}`
            : "N/A"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const status = params.row?.status || params.value;
        return status || "UNKNOWN";
      },
    },
    {
      field: "pre_order_amount",
      headerName: "Paid",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => {
        const value = params.value || params.row?.pre_order_amount || 0;
        return `$${Number(value).toFixed(2)}`;
      },
    },
    {
      field: "created_at",
      headerName: "Created",
      width: 150,
      valueFormatter: (params) => {
        const date = params.value || params.row?.created_at;
        return date ? new Date(date).toLocaleDateString("it-IT") : "N/A";
      },
    },
  ];

  switch (viewType) {
    case "new_orders":
      return [
        ...baseOrderColumns,
        {
          field: "preorder_payment_timestamp",
          headerName: "Payment Time",
          width: 150,
          valueFormatter: (params) => {
            const date = params.value;
            return date ? new Date(date).toLocaleDateString("it-IT") : "N/A";
          },
        },
      ];

    case "tax_requests":
      return [
        ...baseOrderColumns,
        {
          field: "tax_amount",
          headerName: "Tax Due",
          flex: 1,
          minWidth: 100,
          valueFormatter: (params) => {
            const value = params.value || 0;
            return `$${Number(value).toFixed(2)}`;
          },
        },
        {
          field: "tax_request_id",
          headerName: "Tax Request ID",
          flex: 1,
          minWidth: 150,
        },
      ];

    case "failed_orders":
      return [
        ...baseOrderColumns,
        {
          field: "custom_error",
          headerName: "Error Details",
          flex: 2,
          minWidth: 200,
          renderCell: (params) => (
            <span style={{ color: "red", fontSize: "0.9em" }}>
              {params.value || "No error details"}
            </span>
          ),
        },
        {
          field: "modified_at",
          headerName: "Failed At",
          width: 150,
          valueFormatter: (params) => {
            const date = params.value;
            return date ? new Date(date).toLocaleDateString("it-IT") : "N/A";
          },
        },
      ];

    default:
      return baseOrderColumns;
  }
};

// 👈 CONFIGURAZIONI DI VISTA PREDEFINITE
const VIEW_CONFIGS = {
  "1.1": {
    viewType: "new_orders",
    title: "New Orders",
    statusFilter: OrderStatus.PREORDER_PLACED,
    emptyMessage: "Nessun nuovo ordine trovato",
  },
  "1.2": {
    viewType: "tax_requests",
    title: "Tax Requests",
    statusFilter: OrderStatus.AWAITING_TAX,
    emptyMessage: "Nessuna richiesta di tassa trovata",
  },
  "2.1": {
    viewType: "failed_orders",
    title: "Failed Orders",
    statusFilter: OrderStatus.ERROR,
    emptyMessage: "Nessun ordine fallito trovato",
  },
};

// 👈 DATI MOCK PER TEST (rimuovi quando l'API funziona)
const MOCK_ORDERS = [
  {
    id: 1,
    order_id: "ORD_001",
    wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
    status: OrderStatus.PREORDER_PLACED, // 👈 USA L'ENUM
    pre_order_amount: 25.5,
    created_at: "2025-08-30T10:30:00Z",
    modified_at: "2025-08-30T10:30:00Z",
    preorder_payment_timestamp: "2025-08-30T10:30:00Z",
  },
  {
    id: 2,
    order_id: "ORD_002",
    wallet_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    status: OrderStatus.AWAITING_TAX, // 👈 USA L'ENUM
    pre_order_amount: 45.75,
    tax_amount: 8.25,
    tax_request_id: "TAX_REQ_001",
    created_at: "2025-08-29T15:20:00Z",
    modified_at: "2025-08-29T15:20:00Z",
  },
  {
    id: 3,
    order_id: "ORD_003",
    wallet_address: "0x9876543210fedcba9876543210fedcba98765432",
    status: OrderStatus.ERROR, // 👈 USA L'ENUM
    pre_order_amount: 15.25,
    custom_error: "Payment verification failed",
    created_at: "2025-08-28T08:45:00Z",
    modified_at: "2025-08-28T09:15:00Z",
  },
];

const data: StatCardProps[] = [
  {
    title: "Users",
    value: "14k",
    interval: "Last 30 days",
    trend: "up",
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340,
      380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: "Conversions",
    value: "325",
    interval: "Last 30 days",
    trend: "down",
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600,
      820, 780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300,
      220,
    ],
  },
  {
    title: "Event count",
    value: "200k",
    interval: "Last 30 days",
    trend: "neutral",
    data: [
      500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510,
      530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
    ],
  },
];

const treeItems: CustomItem[] = [
  {
    id: "1",
    label: "Placed orders",
    children: [
      { id: "1.1", label: "New Orders", color: "green" },
      { id: "1.2", label: "Tax Requests", color: "green" },
    ],
  },
  {
    id: "2",
    label: "Errors",
    children: [{ id: "2.1", label: "Failed Orders", color: "red" }],
  },
];

// Utilità per raggruppamento per data (FIXED)
const groupByDate = (rows: any[]) => {
  return rows.reduce((acc, order) => {
    // Usa created_at se modified_at non esiste
    const dateField = order.modified_at || order.created_at;
    const key = dateField
      ? new Date(dateField).toLocaleDateString("it-IT")
      : "Data sconosciuta";

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(order);
    return acc;
  }, {} as Record<string, any[]>);
};

export default function MainGrid() {
  const router = useRouter();
  const { orders: apiOrders, loading, error } = useOrdersNoQuery();
  const [selectedNode, setSelectedNode] = useState<CustomItem | null>(null);
  const [tableConfig, setTableConfig] = useState<{
    columns: GridColDef[];
    rows: any[];
    groupByDate?: (r: any[]) => Record<string, any[]>;
    title?: string;
    emptyMessage?: string;
  } | null>(null);

  // 👈 USA DATI MOCK SE L'API È VUOTA (per test)
  const orders = useMemo(() => {
    console.log("🔍 Deciding data source:", {
      apiOrdersExists: !!apiOrders,
      apiOrdersLength: apiOrders?.length || 0,
      loading,
      error: !!error,
    });

    if (!loading && apiOrders && apiOrders.length > 0) {
      console.log("✅ Using real API data:", apiOrders.length);
      return apiOrders;
    } else if (!loading) {
      console.log(
        "🧪 Using mock data for testing (API returned empty or failed)"
      );
      return MOCK_ORDERS;
    } else {
      console.log("⏳ Still loading, returning empty array");
      return [];
    }
  }, [apiOrders, loading, error]);

  // Debug: mostriamo lo stato degli ordini
  useEffect(() => {
    console.log("📊 MainGrid state:", {
      ordersCount: orders?.length || 0,
      loading,
      error: error?.message,
      selectedNode: selectedNode?.id,
      tableConfigRows: tableConfig?.rows?.length || 0,
      usingMockData: orders === MOCK_ORDERS,
    });

    if (orders && orders.length > 0) {
      console.log(
        "📋 Sample order details:",
        JSON.stringify(orders[0], null, 2)
      );

      // Mostra distribuzione per status
      const statusCounts = orders.reduce(
        (acc: Record<string, number>, order) => {
          const status = order.status || "UNKNOWN";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {}
      );
      console.log("📈 Orders by status:", statusCounts);

      // Mostra tutti gli status disponibili vs quelli che cerchiamo
      console.log("🎯 Expected statuses:", {
        PREORDER_PLACED: OrderStatus.PREORDER_PLACED,
        AWAITING_TAX: OrderStatus.AWAITING_TAX,
        ERROR: OrderStatus.ERROR,
      });
    }
  }, [orders, loading, error, selectedNode, tableConfig]);

  const handleSelectItem = (item: CustomItem) => {
    console.log("🎯 handleSelectItem called with:", item.id, item.label);
    console.log("📊 Current orders state:", {
      ordersExists: !!orders,
      ordersLength: orders?.length || 0,
      loading,
      orders: orders,
    });

    setSelectedNode(item);

    // 👈 OTTIENI LA CONFIGURAZIONE PER QUESTA VISTA
    const viewConfig = VIEW_CONFIGS[item.id as keyof typeof VIEW_CONFIGS];

    if (!viewConfig) {
      console.log("🤷 Unknown item id:", item.id);
      setTableConfig(null);
      return;
    }

    // 👈 OTTIENI LE COLONNE SPECIFICHE PER QUESTA VISTA
    const columns = getColumnsForView(viewConfig.viewType);
    console.log(
      "🏗️ Using columns for view type:",
      viewConfig.viewType,
      columns.length
    );

    // Filtra i dati (anche se vuoto, mostra la tabella)
    const ordersToFilter = orders || [];
    const filteredOrders = ordersToFilter.filter((o) => {
      const matches = o.status === viewConfig.statusFilter;
      console.log("🔍 Filter check:", {
        orderStatus: o.status,
        expectedStatus: viewConfig.statusFilter,
        matches: matches,
        orderId: o.order_id,
      });
      return matches;
    });

    console.log(
      `📊 ${viewConfig.title} filtered: ${filteredOrders.length}/${ordersToFilter.length}`
    );

    // 👈 MOSTRA SEMPRE LA TABELLA CON LE COLONNE APPROPRIATE
    setTableConfig({
      columns: columns, // Colonne specifiche per il tipo di vista
      rows: filteredOrders, // Può essere vuoto, ma tabella si vede
      groupByDate: filteredOrders.length > 0 ? groupByDate : undefined,
      title: viewConfig.title,
      emptyMessage: viewConfig.emptyMessage,
    });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Typography variant="h6" sx={{ textAlign: "center", p: 4 }}>
          Caricamento ordini...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        <Typography
          variant="h6"
          color="error"
          sx={{ textAlign: "center", p: 4 }}
        >
          Errore nel caricamento: {error.message}
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          Usando dati mock per il test...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Overview */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: 2 }}>
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>

      {/* Details */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details ({orders?.length || 0} ordini totali)
        {!loading && (!apiOrders || apiOrders.length === 0) && (
          <Typography
            component="span"
            variant="body2"
            color="orange"
            sx={{ ml: 1 }}
          >
            (usando dati mock - API vuota)
          </Typography>
        )}
      </Typography>

      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 2 }}>
          <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <CustomizedTreeView
              title="Orders"
              items={treeItems}
              defaultExpanded={["1", "2"]}
              onSelectItem={handleSelectItem}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 10 }}>
          {tableConfig ? (
            <Box>
              {tableConfig.title && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {tableConfig.title}
                </Typography>
              )}
              <DynamicDataGrid
                columns={tableConfig.columns}
                rows={tableConfig.rows}
                groupByDate={tableConfig.groupByDate}
                emptyMessage={tableConfig.emptyMessage}
              />
            </Box>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                👈 Seleziona una categoria dal menu a sinistra per visualizzare
                gli ordini
              </Typography>
              {selectedNode && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Nodo selezionato: {selectedNode.label} ({selectedNode.id})
                </Typography>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
