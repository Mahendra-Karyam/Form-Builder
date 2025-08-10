import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  addField,
  setFormName,
  saveForm,
  clearCurrentForm,
} from "../store/formBuilderSlice";
import { FormField, FieldType } from "../types/form";
import FieldBuilder from "./FieldBuilder";
import FieldList from "./FieldList";
import { JSX } from "react/jsx-runtime";

const CreateForm = (): JSX.Element => {
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state: RootState) => state.formBuilder);
  const [showFieldBuilder, setShowFieldBuilder] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormNameLocal] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddField = (field: FormField) => {
    dispatch(addField(field));
    setShowFieldBuilder(false);
  };

  const handleSaveForm = () => {
    if (!formName.trim()) {
      return;
    }
    dispatch(setFormName(formName));
    dispatch(saveForm());
    setShowSaveDialog(false);
    setFormNameLocal("");
    setShowSuccessMessage(true);
  };

  const handleNewForm = () => {
    dispatch(clearCurrentForm());
    setFormNameLocal("");
  };

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
          Form Builder
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowFieldBuilder(true)}
          >
            Add Field
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setShowSaveDialog(true)}
            disabled={currentForm.fields.length === 0}
          >
            Save Form
          </Button>
          <Button variant="outlined" onClick={handleNewForm}>
            New Form
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        {currentForm.fields.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No fields added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click "Add Field" to start building your form
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowFieldBuilder(true)}
            >
              Add Your First Field
            </Button>
          </Box>
        ) : (
          <FieldList />
        )}
      </Paper>

      {/* Field Builder Dialog */}
      <Dialog
        open={showFieldBuilder}
        onClose={() => setShowFieldBuilder(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Field</DialogTitle>
        <DialogContent>
          <FieldBuilder
            onSave={handleAddField}
            onCancel={() => setShowFieldBuilder(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Save Form Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            variant="outlined"
            value={formName}
            onChange={(e) => setFormNameLocal(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveForm}
            variant="contained"
            disabled={!formName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccessMessage(false)}>
          Form saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateForm;
