import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  updateField,
  deleteField,
  reorderFields,
} from "../store/formBuilderSlice";
import { FormField } from "../types/form";
import FieldBuilder from "./FieldBuilder";
import { JSX } from "react/jsx-runtime";

const FieldList = (): JSX.Element => {
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state: RootState) => state.formBuilder);
  const [editingField, setEditingField] = useState<{
    field: FormField;
    index: number;
  } | null>(null);

  const handleEditField = (field: FormField, index: number) => {
    setEditingField({ field, index });
  };

  const handleUpdateField = (updatedField: FormField) => {
    if (editingField) {
      dispatch(updateField({ index: editingField.index, field: updatedField }));
      setEditingField(null);
    }
  };

  const handleDeleteField = (index: number) => {
    dispatch(deleteField(index));
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < currentForm.fields.length) {
      dispatch(reorderFields({ fromIndex: index, toIndex: newIndex }));
    }
  };

  const getFieldTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      text: "📝",
      number: "🔢",
      textarea: "📄",
      select: "📋",
      radio: "🔘",
      checkbox: "☑️",
      date: "📅",
    };
    return icons[type] || "📝";
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Form Fields ({currentForm.fields.length})
      </Typography>

      <List>
        {currentForm.fields.map((field, index) => (
          <ListItem key={field.id} sx={{ mb: 1 }}>
            <Paper sx={{ width: "100%", p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: "1.5rem" }}>
                    {getFieldTypeIcon(field.type)}
                  </Typography>

                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {field.label}
                      </Typography>
                      <Chip
                        label={field.type}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      {field.required && (
                        <Chip
                          label="Required"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {field.derivedConfig?.isDerived && (
                        <Chip
                          label="Derived"
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {field.defaultValue && (
                        <Typography variant="body2" color="text.secondary">
                          Default: {field.defaultValue}
                        </Typography>
                      )}

                      {field.validationRules.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Validations: {field.validationRules.length}
                        </Typography>
                      )}

                      {field.options && field.options.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Options: {field.options.length}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveField(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleMoveField(index, "down")}
                    disabled={index === currentForm.fields.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleEditField(field, index)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleDeleteField(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </ListItem>
        ))}
      </List>

      {/* Edit Field Dialog */}
      <Dialog
        open={!!editingField}
        onClose={() => setEditingField(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          {editingField && (
            <FieldBuilder
              field={editingField.field}
              onSave={handleUpdateField}
              onCancel={() => setEditingField(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FieldList;
