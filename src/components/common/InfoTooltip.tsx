import * as React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  IconButton,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

type InfoTooltipProps = {
  title?: string;
  thresholdChars?: number; // if content text > threshold => Dialog
  maxPopoverWidth?: number;
  dialogMaxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
};

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);

  if (Array.isArray(node)) return node.map(extractText).join(" ");

  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<any>;
    return extractText(el.props?.children);
  }

  // ReactPortal also has children, but typing can be awkward—treat unknown as empty.
  return "";
}


export default function InfoTooltip({
  title = "Info",
  thresholdChars = 280,
  maxPopoverWidth = 360,
  dialogMaxWidth = "sm",
  children,
}: InfoTooltipProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const contentText = React.useMemo(() => extractText(children).trim(), [children]);
  const isLong = contentText.length > thresholdChars;

  const open = Boolean(anchorEl);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isLong) {
      setDialogOpen(true);
      return;
    }
    setAnchorEl(e.currentTarget);
  };

  const closePopover = () => setAnchorEl(null);
  const closeDialog = () => setDialogOpen(false);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label={`${title} info`}
        sx={{
          ml: 0.5,
          p: 0.25,
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>

      {/* Short content => Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            p: 1.25,
            maxWidth: maxPopoverWidth,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Box sx={{ typography: "body2", color: "text.secondary" }}>{children}</Box>
        </Box>
      </Popover>

      {/* Long content => Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog} // Esc + backdrop closes
        maxWidth={dialogMaxWidth}
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: "60vh",
            "& .MuiTypography-root": { lineHeight: 1.5 },
          }}
        >
          <Box sx={{ typography: "body2", color: "text.secondary" }}>{children}</Box>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.25 }}>
          <Button onClick={closeDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
