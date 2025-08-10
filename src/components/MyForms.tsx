import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { loadSavedForms } from "../store/formBuilderSlice";
import { JSX } from "react/jsx-runtime";

const MyForms = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedForms } = useSelector((state: RootState) => state.formBuilder);

  React.useEffect(() => {
    dispatch(loadSavedForms());
  }, [dispatch]);

  const handlePreviewForm = (formId: string) => {
    navigate(`/preview/${formId}`);
  };

  const handleDeleteForm = (formId: string) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      const updatedForms = savedForms.filter((form) => form.id !== formId);
      localStorage.setItem(
        "formBuilder_savedForms",
        JSON.stringify(updatedForms)
      );
      dispatch(loadSavedForms());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFieldTypeCounts = (fields: any[]) => {
    const counts: { [key: string]: number } = {};
    fields.forEach((field) => {
      counts[field.type] = (counts[field.type] || 0) + 1;
    });
    return counts;
  };

  if (savedForms.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No saved forms yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your first form to see it here
        </Typography>
        <Button variant="contained" onClick={() => navigate("/create")}>
          Create Form
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          My Forms ({savedForms.length})
        </Typography>
        <Button variant="contained" onClick={() => navigate("/create")}>
          Create New Form
        </Button>
      </Box>

      <List>
        {savedForms.map((form) => {
          const fieldCounts = getFieldTypeCounts(form.fields);

          return (
            <ListItem key={form.id} sx={{ mb: 2, p: 0 }}>
              <Paper sx={{ width: "100%", p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {form.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Created: {formatDate(form.createdAt)}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      <Chip
                        label={`${form.fields.length} fields`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />

                      {Object.entries(fieldCounts).map(([type, count]) => (
                        <Chip
                          key={type}
                          label={`${count} ${type}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}

                      {form.fields.some((f) => f.required) && (
                        <Chip
                          label="Has required fields"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}

                      {form.fields.some((f) => f.derivedConfig?.isDerived) && (
                        <Chip
                          label="Has derived fields"
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Fields: {form.fields.map((f) => f.label).join(", ")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                    <IconButton
                      onClick={() => handlePreviewForm(form.id)}
                      color="primary"
                      title="Preview Form"
                    >
                      <VisibilityIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => handleDeleteForm(form.id)}
                      color="error"
                      title="Delete Form"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default MyForms;
