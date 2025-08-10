import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  FormField,
  FieldType,
  ValidationRule,
  SelectOption,
  DerivedFieldConfig,
} from "../types/form";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { JSX } from "react/jsx-runtime";

interface FieldBuilderProps {
  field?: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}

const FieldBuilder = ({
  field,
  onSave,
  onCancel,
}: FieldBuilderProps): JSX.Element => {
  const { currentForm } = useSelector((state: RootState) => state.formBuilder);

  const [fieldData, setFieldData] = useState<FormField>({
    id: field?.id || Date.now().toString(),
    type: field?.type || "text",
    label: field?.label || "",
    required: field?.required || false,
    defaultValue: field?.defaultValue || "",
    validationRules: field?.validationRules || [],
    options: field?.options || [],
    derivedConfig: field?.derivedConfig || {
      isDerived: false,
      parentFields: [],
      formula: "",
    },
  });

  const [newOption, setNewOption] = useState({ label: "", value: "" });
  const [newValidation, setNewValidation] = useState<Partial<ValidationRule>>({
    type: "required",
    message: "",
  });

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Select" },
    { value: "radio", label: "Radio" },
    { value: "checkbox", label: "Checkbox" },
    { value: "date", label: "Date" },
  ];

  const validationTypes = [
    { value: "required", label: "Required" },
    { value: "minLength", label: "Minimum Length" },
    { value: "maxLength", label: "Maximum Length" },
    { value: "email", label: "Email Format" },
    { value: "password", label: "Password Rules" },
  ];

  const handleFieldChange = (key: keyof FormField, value: any) => {
    setFieldData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOption = () => {
    if (newOption.label && newOption.value) {
      setFieldData((prev) => ({
        ...prev,
        options: [...(prev.options || []), { ...newOption }],
      }));
      setNewOption({ label: "", value: "" });
    }
  };

  const handleRemoveOption = (index: number) => {
    setFieldData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddValidation = () => {
    if (newValidation.type && newValidation.message) {
      const validation: ValidationRule = {
        type: newValidation.type as ValidationRule["type"],
        value: newValidation.value,
        message: newValidation.message,
      };
      setFieldData((prev) => ({
        ...prev,
        validationRules: [...prev.validationRules, validation],
      }));
      setNewValidation({ type: "required", message: "" });
    }
  };

  const handleRemoveValidation = (index: number) => {
    setFieldData((prev) => ({
      ...prev,
      validationRules: prev.validationRules.filter((_, i) => i !== index),
    }));
  };

  const handleDerivedConfigChange = (
    key: keyof DerivedFieldConfig,
    value: any
  ) => {
    setFieldData((prev) => ({
      ...prev,
      derivedConfig: {
        ...prev.derivedConfig!,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!fieldData.label.trim()) {
      return;
    }
    onSave(fieldData);
  };

  const needsOptions =
    fieldData.type === "select" || fieldData.type === "radio";
  const availableParentFields = currentForm.fields.filter(
    (f) => f.id !== fieldData.id
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Field Type</InputLabel>
          <Select
            value={fieldData.type}
            label="Field Type"
            onChange={(e) => handleFieldChange("type", e.target.value)}
          >
            {fieldTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Field Label"
          value={fieldData.label}
          onChange={(e) => handleFieldChange("label", e.target.value)}
          required
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={fieldData.required}
              onChange={(e) => handleFieldChange("required", e.target.checked)}
            />
          }
          label="Required"
        />

        <TextField
          fullWidth
          label="Default Value"
          value={fieldData.defaultValue}
          onChange={(e) => handleFieldChange("defaultValue", e.target.value)}
          type={
            fieldData.type === "number"
              ? "number"
              : fieldData.type === "date"
                ? "date"
                : "text"
          }
          InputLabelProps={
            fieldData.type === "date" ? { shrink: true } : undefined
          }
        />
      </Box>

      {/* Options for Select and Radio fields */}
      {needsOptions && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Options ({fieldData.options?.length || 0})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Option Label"
                value={newOption.label}
                onChange={(e) =>
                  setNewOption((prev) => ({ ...prev, label: e.target.value }))
                }
              />
              <TextField
                label="Option Value"
                value={newOption.value}
                onChange={(e) =>
                  setNewOption((prev) => ({ ...prev, value: e.target.value }))
                }
              />
              <Button onClick={handleAddOption} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {fieldData.options?.map((option, index) => (
                <Chip
                  key={index}
                  label={`${option.label} (${option.value})`}
                  onDelete={() => handleRemoveOption(index)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Validation Rules */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Validation Rules ({fieldData.validationRules.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-end" }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Validation Type</InputLabel>
              <Select
                value={newValidation.type}
                label="Validation Type"
                onChange={(e) =>
                  setNewValidation((prev) => ({
                    ...prev,
                    type: e.target.value as ValidationRule["type"],
                  }))
                }
              >
                {validationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(newValidation.type === "minLength" ||
              newValidation.type === "maxLength") && (
              <TextField
                label="Length"
                type="number"
                value={newValidation.value || ""}
                onChange={(e) =>
                  setNewValidation((prev) => ({
                    ...prev,
                    value: parseInt(e.target.value),
                  }))
                }
              />
            )}

            <TextField
              label="Error Message"
              value={newValidation.message}
              onChange={(e) =>
                setNewValidation((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              sx={{ flexGrow: 1 }}
            />

            <Button onClick={handleAddValidation} startIcon={<AddIcon />}>
              Add
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {fieldData.validationRules.map((rule, index) => (
              <Chip
                key={index}
                label={`${rule.type}${rule.value ? ` (${rule.value})` : ""}: ${
                  rule.message
                }`}
                onDelete={() => handleRemoveValidation(index)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Derived Field Configuration */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Derived Field Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={fieldData.derivedConfig?.isDerived || false}
                onChange={(e) =>
                  handleDerivedConfigChange("isDerived", e.target.checked)
                }
              />
            }
            label="This is a derived field"
            sx={{ mb: 2 }}
          />

          {fieldData.derivedConfig?.isDerived && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Parent Fields</InputLabel>
                <Select
                  multiple
                  value={fieldData.derivedConfig.parentFields}
                  label="Parent Fields"
                  onChange={(e) =>
                    handleDerivedConfigChange("parentFields", e.target.value)
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const field = availableParentFields.find(
                          (f) => f.id === value
                        );
                        return (
                          <Chip key={value} label={field?.label || value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {availableParentFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Formula"
                value={fieldData.derivedConfig.formula}
                onChange={(e) =>
                  handleDerivedConfigChange("formula", e.target.value)
                }
                placeholder="e.g., field1 + field2 or custom logic"
                multiline
                rows={2}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!fieldData.label.trim()}
        >
          {field ? "Update" : "Add"} Field
        </Button>
      </Box>
    </Box>
  );
};

export default FieldBuilder;
