import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link} from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loginValue, setLoginValue] = useState({});
  const [isSubmit , setIsSubmit]= useState(false);
  let history = useHistory();



  const handleChange = (e) =>{
    const {name, value} = e.target;
    setLoginValue({...loginValue, [name] : value})
  } 
  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const url = `${config.endpoint}/auth/login`  
  const LoginAuth = async (formData) => {
   
    const valid = validateInput(formData);

    const data = {username:formData.username, password:formData.password};
   

    try{
     if(valid){
      const response = await axios.post(url, data);
      if(response.status === 201){
        enqueueSnackbar("Logged in successfully", {
          variant: 'success',
        }); 
       PersistLogin(response.data.token, formData.username, 5000);
      //  localStorage.setItem("username",JSON.stringify(name));
        history.push('/');

      }else{
        enqueueSnackbar("User doesn't exit", {
          variant: 'warning',
        });
      }  
     }
    }catch{
      enqueueSnackbar("password is incorrect", {
        variant: 'warning',
      }); 
    }
       
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if(!data.username){
      enqueueSnackbar('Username is a required field', {
        variant: 'warning',
      }); 
       return false;
    }else if(!data.password){
      enqueueSnackbar('Password is a required field ', {
        variant: 'warning',
      }); 
      return false
    }

    return true;
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const PersistLogin = (token, username, balance) => {

    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    localStorage.setItem("balance", balance);

  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
        <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value = {loginValue.username}
            onChange = {handleChange}
          />

           <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value = {loginValue.password}
            onChange = {handleChange}
           
          />

            <Button className="button" variant="contained" onClick = {()=>LoginAuth(loginValue)}>
            LOGIN TO QKART
             </Button>
             <p className="secondary-action">
             Don’t have an account?{" "}
             <Link to ="/register" className="link" href="#">
             Register now
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
