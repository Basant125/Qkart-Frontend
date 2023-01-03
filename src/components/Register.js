import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import { useHistory, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formError, setFromError] = useState({});
  const [formValue, setFormValue] = useState({});
  const [isSubmit , setIsSubmit]= useState(false);
  

  const navigate = useHistory();
  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register functio


  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */

   const handleChange = (e) => {
     const {name , value} = e.target;
     setFormValue({...formValue, [name]:value , id : new Date().getTime().toString()});
}

  const url = `${config.endpoint}/auth/register`  

  const RegisterAuth = async (formData) => {
     setIsSubmit(true);
    const data = {username:formData.username,password:formData.password};
  const valid = validateInput(formValue)
  try{
    if(valid){
     const response =  await axios.post(url, data)
     if(response.status ===200){
      enqueueSnackbar('registered successfully', {
        variant: 'success',
      }); 
      
     }else{
      enqueueSnackbar('success', {
        variant: 'success',
      }); 

      navigate.push('/login')
      setIsSubmit(false);
     }
   }
   setIsSubmit(false);
  }
  catch{
    enqueueSnackbar('Username is already taken', {
      variant: 'error',
    }); 
    setIsSubmit(false);
        }

      } 
    

  // useEffect(() =>{
  //   console.log(formError);
  //   if(Object.keys(formError).lenght ===0 && isSubmit){
  //     console.log(formValue)
  //   }
  // },[formError])


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  
   
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   * 
   * 
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
     if(!data.username){
      enqueueSnackbar('Username is a required field', {
        variant: 'warning',
      }); 
       return false;

     }else if(data.username.length < 6){
      enqueueSnackbar('Username must be at least 6 characters ', {
        variant: 'warning',
      }); 
      return false

     }else if(!data.password){
      enqueueSnackbar('Password is a required field ', {
        variant: 'warning',
      }); 
      return false

     }else if(data.password.length < 6){
      enqueueSnackbar('Password must be at least 6 characters ', {
        variant: 'warning',
      }); 
      return false

     }else if(data.confirmPassword !== data.password){
      enqueueSnackbar('Passwords do not match ', {
        variant: 'warning',
      }); 
      return false
     }
 

     return true
    }

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
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value = {formValue.username}
            onChange = {handleChange}
          />
         <span>{formError.username}</span>
            
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value = {formValue.password}
            onChange = {handleChange}
           
          />
             <span>{formError.password}</span>
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value = {formValue.confirmPassword}
            onChange = {handleChange}
           
          />
            {
              isSubmit ? (<div className ="loading"><CircularProgress /></div>): ( <Button className="button" variant="contained" onClick = {() =>  RegisterAuth(formValue)}>
              Register Now
             </Button>)
            }
          
          {/* (<CircularProgress />) */}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link to = "/login" className="link" href="#">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register 
