import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Button,
  Alert,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  loadFormForPreview,
  updatePreviewData,
  setValidationErrors,
} from "../store/formBuilderSlice";
import { FormField, ValidationError, FormData } from "../types/form";
import { JSX } from "react/jsx-runtime";

const PreviewForm = (): JSX.Element => {
  const { formId } = useParams<{ formId: string }>();
  const dispatch = useDispatch();
  const { currentForm, previewData, validationErrors, savedForms } =
    useSelector((state: RootState) => state.formBuilder);
  const [derivedValues, setDerivedValues] = useState<{
    [fieldId: string]: any;
  }>({});

  useEffect(() => {
    if (formId) {
      dispatch(loadFormForPreview(formId));
    }
  }, [formId, dispatch]);

  useEffect(() => {
    // Calculate derived field values
    const newDerivedValues: { [fieldId: string]: any } = {};

    currentForm.fields.forEach((field) => {
      if (
        field.derivedConfig?.isDerived &&
        field.derivedConfig.parentFields.length > 0
      ) {
        const derivedValue = calculateDerivedValue(field, previewData);
        newDerivedValues[field.id] = derivedValue;
      }
    });

    setDerivedValues(newDerivedValues);
  }, [previewData, currentForm.fields]);

  const calculateDerivedValue = (field: FormField, data: FormData): any => {
    if (!field.derivedConfig?.isDerived) return "";

    const { parentFields, formula } = field.derivedConfig;

    try {
      // Simple formula evaluation for common cases
      if (
        formula.includes("+") ||
        formula.includes("-") ||
        formula.includes("*") ||
        formula.includes("/")
      ) {
        let expression = formula;
        parentFields.forEach((parentId) => {
          const parentField = currentForm.fields.find((f) => f.id === parentId);
          const value = data[parentId] || 0;
          expression = expression.replace(
            new RegExp(`\\b${parentField?.label || parentId}\\b`, "g"),
            value.toString()
          );
        });

        // Basic math evaluation (be careful in production!)
        const result = Function(`"use strict"; return (${expression})`)();
        return isNaN(result) ? "" : result;
      }

      // Age calculation from date of birth
      if (formula.toLowerCase().includes("age") && parentFields.length === 1) {
        const birthDate = data[parentFields[0]];
        if (birthDate) {
          const today = new Date();
          const birth = new Date(birthDate);
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
          ) {
            age--;
          }
          return age;
        }
      }

      // Concatenation
      if (formula.includes("concat") || formula.includes("+")) {
        return parentFields.map((id) => data[id] || "").join(" ");
      }

      return "";
    } catch (error) {
      return "";
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    dispatch(updatePreviewData({ fieldId, value }));
  };

  const validateField = (field: FormField, value: any): string | null => {
    for (const rule of field.validationRules) {
      switch (rule.type) {
        case "required":
          if (!value || (typeof value === "string" && !value.trim())) {
            return rule.message;
          }
          break;
        case "minLength":
          if (
            typeof value === "string" &&
            value.length < (rule.value as number)
          ) {
            return rule.message;
          }
          break;
        case "maxLength":
          if (
            typeof value === "string" &&
            value.length > (rule.value as number)
          ) {
            return rule.message;
          }
          break;
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            return rule.message;
          }
          break;
        case "password":
          if (value && (value.length < 8 || !/\d/.test(value))) {
            return rule.message;
          }
          break;
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: ValidationError[] = [];

    currentForm.fields.forEach((field) => {
      if (!field.derivedConfig?.isDerived) {
        const value = previewData[field.id];
        const error = validateField(field, value);
        if (error) {
          errors.push({ fieldId: field.id, message: error });
        }
      }
    });

    dispatch(setValidationErrors(errors));

    if (errors.length === 0) {
      alert("Form submitted successfully!");
    }
  };

  const getFieldError = (fieldId: string): string | undefined => {
    return validationErrors.find((error) => error.fieldId === fieldId)?.message;
  };

  const renderField = (field: FormField) => {
    const value = field.derivedConfig?.isDerived
      ? derivedValues[field.id] || ""
      : previewData[field.id] || field.defaultValue || "";
    const error = getFieldError(field.id);
    const isReadOnly = field.derivedConfig?.isDerived;

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) =>
              !isReadOnly && handleFieldChange(field.id, e.target.value)
            }
            required={field.required}
            error={!!error}
            helperText={
              error ||
              (isReadOnly ? "This field is automatically calculated" : "")
            }
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        );

      case "number":
        return (
          <TextField
            key={field.id}
            fullWidth
            type="number"
            label={field.label}
            value={value}
            onChange={(e) =>
              !isReadOnly &&
              handleFieldChange(field.id, parseFloat(e.target.value) || "")
            }
            required={field.required}
            error={!!error}
            helperText={
              error ||
              (isReadOnly ? "This field is automatically calculated" : "")
            }
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        );

      case "textarea":
        return (
          <TextField
            key={field.id}
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value}
            onChange={(e) =>
              !isReadOnly && handleFieldChange(field.id, e.target.value)
            }
            required={field.required}
            error={!!error}
            helperText={
              error ||
              (isReadOnly ? "This field is automatically calculated" : "")
            }
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        );

      case "select":
        return (
          <FormControl key={field.id} fullWidth sx={{ mb: 2 }} error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) =>
                !isReadOnly && handleFieldChange(field.id, e.target.value)
              }
              required={field.required}
              readOnly={isReadOnly}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || isReadOnly) && (
              <Typography
                variant="caption"
                color={error ? "error" : "text.secondary"}
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {error || "This field is automatically calculated"}
              </Typography>
            )}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl
            key={field.id}
            component="fieldset"
            sx={{ mb: 2 }}
            error={!!error}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) =>
                !isReadOnly && handleFieldChange(field.id, e.target.value)
              }
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={isReadOnly}
                />
              ))}
            </RadioGroup>
            {(error || isReadOnly) && (
              <Typography
                variant="caption"
                color={error ? "error" : "text.secondary"}
              >
                {error || "This field is automatically calculated"}
              </Typography>
            )}
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) =>
                  !isReadOnly && handleFieldChange(field.id, e.target.checked)
                }
                disabled={isReadOnly}
              />
            }
            label={field.label}
            sx={{ mb: 2, display: "block" }}
          />
        );

      case "date":
        return (
          <TextField
            key={field.id}
            fullWidth
            type="date"
            label={field.label}
            value={value}
            onChange={(e) =>
              !isReadOnly && handleFieldChange(field.id, e.target.value)
            }
            required={field.required}
            error={!!error}
            helperText={
              error ||
              (isReadOnly ? "This field is automatically calculated" : "")
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        );

      default:
        return null;
    }
  };

  if (currentForm.fields.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No form to preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a form first or select a saved form to preview
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {currentForm.name || "Form Preview"}
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {currentForm.fields.map(renderField)}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" size="large">
              Submit Form
            </Button>
          </Box>
        </Box>
      </Paper>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the validation errors above before submitting.
        </Alert>
      )}
    </Box>
  );
};

export default PreviewForm;
