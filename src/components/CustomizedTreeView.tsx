import * as React from "react";
import clsx from "clsx";
import { animated, useSpring } from "@react-spring/web";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import {
  RichTreeView,
  useTreeItem,
  TreeItemProvider,
  TreeItemRoot,
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemIcon,
  UseTreeItemParameters,
} from "@mui/x-tree-view";

type Color = "blue" | "green" | "red";

type TreeItemExtraProps = {
  link?: string;
  color?: Color;
};

export type CustomItem = {
  id: string;
  label: string;
  children?: CustomItem[];
} & TreeItemExtraProps;

interface CustomizedTreeViewProps {
  title?: string;
  items: CustomItem[];
  defaultExpanded?: string[];
  defaultSelected?: string[];
  onLinkClick?: (link: string) => void;
  onSelectItem?: (item: CustomItem) => void; // 👈 Callback principale
}

export interface CustomTreeItemProps
  extends Omit<UseTreeItemParameters, "rootRef">,
    Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {
  onItemClick?: (itemId: string, link?: string) => void;
  onSelectItem?: (item: CustomItem) => void; // 👈 Aggiungi questa prop
  allItems?: CustomItem[]; // 👈 Per trovare l'item completo
}

function DotIcon({ color }: { color: string }) {
  return (
    <Box sx={{ mr: 0.5, display: "flex", alignItems: "center" }}>
      <svg width={6} height={6}>
        <circle cx={3} cy={3} r={3} fill={color} />
      </svg>
    </Box>
  );
}

function CustomLabel({
  color,
  children,
  ...other
}: {
  color?: Color;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const colors = {
    blue: (theme.vars || theme).palette.primary.main,
    green: (theme.vars || theme).palette.success.main,
    red: (theme.vars || theme).palette.error.main,
  };

  const iconColor = color ? colors[color] : undefined;

  return (
    <TreeItemLabel {...other} sx={{ display: "flex", alignItems: "center" }}>
      {iconColor && <DotIcon color={iconColor} />}
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {children}
      </Typography>
    </TreeItemLabel>
  );
}

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props: { in: boolean }) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

// 👈 Funzione helper per trovare un item nell'albero
function findItemById(items: CustomItem[], id: string): CustomItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

const CustomTreeItem = React.forwardRef<HTMLLIElement, CustomTreeItemProps>(
  function CustomTreeItem(props, ref) {
    const {
      id,
      itemId,
      label,
      disabled,
      children,
      onItemClick,
      onSelectItem,
      allItems,
      ...other
    } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getLabelProps,
      getGroupTransitionProps,
      status,
      publicAPI,
    } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

    const item = publicAPI.getItem(itemId) as CustomItem;
    const color = item?.color;

    const handleClick = (event: React.MouseEvent) => {
      console.log("🌳 TreeItem clicked:", itemId, label);

      // Gestisci il link se esiste
      if (onItemClick && item?.link) {
        onItemClick(itemId, item.link);
      }

      // 👈 NUOVO: Gestisci la selezione per il callback principale
      if (onSelectItem && allItems) {
        const fullItem = findItemById(allItems, itemId);
        if (fullItem) {
          console.log("✅ Calling onSelectItem with:", fullItem);
          onSelectItem(fullItem);
        }
      }
    };

    return (
      <TreeItemProvider id={id} itemId={itemId}>
        <TreeItemRoot {...getRootProps(other)}>
          <TreeItemContent
            {...getContentProps({
              className: clsx("content", {
                expanded: status.expanded,
                selected: status.selected,
                focused: status.focused,
                disabled: status.disabled,
              }),
              onClick: handleClick, // 👈 Aggiungi il click handler
            })}
          >
            {status.expandable && (
              <TreeItemIconContainer {...getIconContainerProps()}>
                <TreeItemIcon status={status} />
              </TreeItemIconContainer>
            )}
            <CustomLabel {...getLabelProps({ color })} />
          </TreeItemContent>
          {children && (
            <TransitionComponent
              {...getGroupTransitionProps({ className: "groupTransition" })}
            />
          )}
        </TreeItemRoot>
      </TreeItemProvider>
    );
  }
);

export default function CustomizedTreeView({
  title = "Tree",
  items,
  defaultExpanded = [],
  defaultSelected = [],
  onLinkClick,
  onSelectItem, // 👈 Ricevi la callback
}: CustomizedTreeViewProps) {
  // 👈 NUOVO: Gestisci la selezione del tree
  const handleSelectionChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    console.log("🎯 Tree selection changed:", itemIds);

    if (onSelectItem && itemIds.length > 0) {
      const selectedId = itemIds[itemIds.length - 1]; // Prendi l'ultimo selezionato
      const selectedItem = findItemById(items, selectedId);

      if (selectedItem) {
        console.log("📋 Found selected item:", selectedItem);

        // 👈 FILTRA SOLO I NODI FOGLIA (che hanno i dati)
        // Non processare i nodi parent che non hanno configurazione
        const isLeafNode =
          !selectedItem.children || selectedItem.children.length === 0;

        if (isLeafNode) {
          console.log("✅ Processing leaf node:", selectedItem.id);
          onSelectItem(selectedItem);
        } else {
          console.log("⏭️ Skipping parent node:", selectedItem.id);
        }
      }
    }
  };

  const Item = React.forwardRef<HTMLLIElement, CustomTreeItemProps>(
    function Item(props, ref) {
      return (
        <CustomTreeItem
          ref={ref}
          {...props}
          allItems={items} // 👈 Passa tutti gli items
          onSelectItem={onSelectItem} // 👈 Passa la callback
          onItemClick={(itemId, link) => {
            if (link && onLinkClick) {
              onLinkClick(link);
            }
          }}
        />
      );
    }
  );

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      <Typography
        component="h2"
        variant="subtitle2"
        sx={{ px: 1, py: 1, fontWeight: 500 }}
      >
        {title}
      </Typography>
      <RichTreeView<CustomItem>
        items={items}
        aria-label={title}
        multiSelect={false} // 👈 Cambia a single select per semplicità
        defaultExpandedItems={defaultExpanded}
        defaultSelectedItems={defaultSelected}
        onSelectedItemsChange={handleSelectionChange} // 👈 NUOVO: Gestisci la selezione
        sx={{
          px: 1,
          pb: 1,
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        slots={{ item: Item }}
      />
    </Box>
  );
}
