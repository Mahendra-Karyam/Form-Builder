import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormField, FormSchema, FormData, ValidationError } from '../types/form';

interface FormBuilderState {
  currentForm: {
    name: string;
    fields: FormField[];
  };
  savedForms: FormSchema[];
  previewData: FormData;
  validationErrors: ValidationError[];
}

const initialState: FormBuilderState = {
  currentForm: {
    name: '',
    fields: [],
  },
  savedForms: [],
  previewData: {},
  validationErrors: [],
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    addField: (state, action: PayloadAction<FormField>) => {
      state.currentForm.fields.push(action.payload);
    },
    updateField: (state, action: PayloadAction<{ index: number; field: FormField }>) => {
      state.currentForm.fields[action.payload.index] = action.payload.field;
    },
    deleteField: (state, action: PayloadAction<number>) => {
      state.currentForm.fields.splice(action.payload, 1);
    },
    reorderFields: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.currentForm.fields.splice(fromIndex, 1);
      state.currentForm.fields.splice(toIndex, 0, removed);
    },
    setFormName: (state, action: PayloadAction<string>) => {
      state.currentForm.name = action.payload;
    },
    saveForm: (state) => {
      if (state.currentForm.name && state.currentForm.fields.length > 0) {
        const formSchema: FormSchema = {
          id: Date.now().toString(),
          name: state.currentForm.name,
          fields: [...state.currentForm.fields],
          createdAt: new Date().toISOString(),
        };
        state.savedForms.push(formSchema);
        // Save to localStorage
        localStorage.setItem('formBuilder_savedForms', JSON.stringify(state.savedForms));
        // Reset current form
        state.currentForm = { name: '', fields: [] };
      }
    },
    loadSavedForms: (state) => {
      const saved = localStorage.getItem('formBuilder_savedForms');
      if (saved) {
        state.savedForms = JSON.parse(saved);
      }
    },
    loadFormForPreview: (state, action: PayloadAction<string>) => {
      const form = state.savedForms.find(f => f.id === action.payload);
      if (form) {
        state.currentForm = { name: form.name, fields: form.fields };
        state.previewData = {};
        state.validationErrors = [];
      }
    },
    updatePreviewData: (state, action: PayloadAction<{ fieldId: string; value: any }>) => {
      state.previewData[action.payload.fieldId] = action.payload.value;
    },
    setValidationErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.validationErrors = action.payload;
    },
    clearCurrentForm: (state) => {
      state.currentForm = { name: '', fields: [] };
      state.previewData = {};
      state.validationErrors = [];
    },
  },
});

export const {
  addField,
  updateField,
  deleteField,
  reorderFields,
  setFormName,
  saveForm,
  loadSavedForms,
  loadFormForPreview,
  updatePreviewData,
  setValidationErrors,
  clearCurrentForm,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;