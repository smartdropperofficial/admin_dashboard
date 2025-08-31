import React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface DynamicDataGridProps {
  columns: GridColDef[];
  rows: any[];
  groupByDate?: (rows: any[]) => Record<string, any[]>;
  emptyMessage?: string;
}

export default function DynamicDataGrid({
  columns,
  rows,
  groupByDate,
  emptyMessage = "Nessun ordine trovato per questa categoria",
}: DynamicDataGridProps) {
  // Debug: mostriamo cosa arriva
  React.useEffect(() => {
    console.log("🔍 DynamicDataGrid received:", {
      columns: columns.length,
      columnNames: columns.map((c) => c.field),
      rows: rows.length,
      groupByDate: !!groupByDate,
      sampleRowFull:
        rows.length > 0 ? JSON.stringify(rows[0], null, 2) : "No rows",
      emptyMessage,
    });

    if (rows.length > 0) {
      console.log(
        "📊 Row analysis:",
        rows.map((row, i) => ({
          index: i,
          id: row.id,
          order_id: row.order_id,
          status: row.status,
          hasRequiredFields: !!(row.id && row.order_id),
        }))
      );
    }
  }, [columns, rows, groupByDate, emptyMessage]);

  // Se non ci sono dati
  if (!rows || rows.length === 0) {
    return (
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={[]} // Array vuoto
          columns={columns} // 👈 MOSTRA SEMPRE LE COLONNE!
          getRowId={(row) => row.id || row.order_id || Math.random()}
          hideFooter
          sx={{
            "& .MuiDataGrid-overlay": {
              backgroundColor: "transparent",
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Le colonne sono pronte per quando arriveranno i dati
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>
    );
  }

  // Se non abbiamo la funzione di raggruppamento, mostra tabella normale
  if (!groupByDate) {
    return (
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id || row.order_id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </Box>
    );
  }

  // Raggruppa i dati per data
  const groupedData = groupByDate(rows);
  const dateKeys = Object.keys(groupedData).sort().reverse(); // date più recenti prima

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ordini raggruppati per data ({rows.length} totali)
      </Typography>

      {dateKeys.map((date, index) => {
        const dayOrders = groupedData[date];

        return (
          <Accordion
            key={date}
            defaultExpanded={index === 0} // primo gruppo aperto di default
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {date} ({dayOrders.length} ordini)
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Box
                sx={{
                  height: Math.min(400, dayOrders.length * 52 + 100),
                  width: "100%",
                }}
              >
                <DataGrid
                  rows={dayOrders}
                  columns={columns}
                  getRowId={(row) => row.id || row.order_id}
                  hideFooter={dayOrders.length <= 5}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection={false}
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
