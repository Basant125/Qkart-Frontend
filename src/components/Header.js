import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import {useHistory} from 'react-router-dom'
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {

    let navigate = useHistory();

    const navigateHandle = ()=> {
       navigate.push('/')
    }

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick ={navigateHandle}
        >
          Back to explore
        </Button>
       
      </Box>
    );
};

export default Header;
