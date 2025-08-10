import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { loadSavedForms } from "./store/formBuilderSlice";
import CreateForm from "./components/CreateForm";
import PreviewForm from "./components/PreviewForm";
import MyForms from "./components/MyForms";
import { JSX } from "react/jsx-runtime";

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(loadSavedForms());
  }, [dispatch]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/create":
        return "Create Form";
      case "/preview":
        return "Preview Form";
      case "/myforms":
        return "My Forms";
      default:
        return "Form Builder";
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          <Button color="inherit" component={Link} to="/create">
            Create
          </Button>
          <Button color="inherit" component={Link} to="/preview">
            Preview
          </Button>
          <Button color="inherit" component={Link} to="/myforms">
            My Forms
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreateForm />} />
          <Route path="/preview" element={<PreviewForm />} />
          <Route path="/preview/:formId" element={<PreviewForm />} />
          <Route path="/myforms" element={<MyForms />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
