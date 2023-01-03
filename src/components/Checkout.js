import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */


/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
  setShow
}) => {
  const [addressText, setAddressText]=  useState('')


  const handleAddressText = (e) =>{
    const value = e.target.value;
    setAddressText(value);

  }

  const handleAdd = async(value) =>{

    const addText = {address:value,}
    handleNewAddress({isAddingNewAddress : true,value: value});
    await addAddress(token, addText) 
    setAddressText('');
  }

  const handleCancelAddress = () =>{
    setShow(false)
  }


 
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        value = {addressText}
        onChange = {handleAddressText}
        placeholder="Enter your complete address"
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick ={async() => await handleAdd(addressText)}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick = {handleCancelAddress}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [show ,setShow] = useState(false);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   * 
   * 
   */

  const addAddress = async (token, newAddress) => {

    if(!token){ 
  return ;
    }

    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Add new address to the backend and display the latest list of addresses
      const response = await axios.post(`${config.endpoint}/user/addresses`, newAddress,
      {
        headers: {
          Authorization: `Bearer ${token}`
        } 
      })

       const data = await response.data;
       setAddresses({ ...addresses, all: data });

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const deleteAddress = async (token, addressId) => {
    if(!token){
      return ;
    }
  
    try {
    // TODO: CRIO_TASK_MODULE_CHECKOUT - Delete selected address from the backend and display the latest list of addresse
    const response = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`, {headers: {
      Authorization: `Bearer ${token}`
    }})
    const data = await response.data;
    setAddresses({...addresses, all : data});
    return data;
  
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };


  const handleAddressSelect  = async( id) => {
  
    //  const addressItem = addresses?.all.filter((item) => item._id === id);
    //  const selectAddress = addressItem[0].address;
    setAddresses((currAddress) => ({
      ...currAddress,
      selected: id,
    }));
  }

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   *  1. Not enough balance available to checkout cart items
   *    "You do not have enough balance in your wallet for this purchase"
   *
   *  2. No addresses added for user
   *    "Please add a new address before proceeding."
   *
   *  3. No address selected for checkout
   *    "Please select one shipping address to proceed."
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses) => {

    const cost = getTotalCartValue(items);
    const walletBalance = parseInt(localStorage.getItem("balance"))
    console.log(walletBalance < cost, "check")
   
    if( walletBalance < cost){ 
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase.",
        {
          variant: "error",
        }
      );
      return false
    }else if(addresses?.all.length === 0){
      enqueueSnackbar(
        "Please add a new address before proceeding.",
        {
          variant: "error",
        }
      );
      return false;
    }else if(addresses?.selected.length === 0){
      enqueueSnackbar(
        "Please select one shipping address to proceed.",
        {
          variant: "error",
        }
      );
      return false
    }else{
      return true;
    }

   
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT
  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *  "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *  "success": false,
   *  "message": "Wallet balance not sufficient to place order"
   * }
   *
   */
  const performCheckout = async (token, items, addresses) => {

    const checkValidate = validateRequest(items,addresses)

    if(checkValidate){
         try{

          const checkouData = {addressId : addresses?.selected}
            const response = await axios.post(`${config.endpoint}/cart/checkout`,checkouData, {headers : {
              Authorization : `Bearer ${token}`
            }})
              enqueueSnackbar("Order placed successfully", {variant : "success"});
              history.push("/thanks")
            const data = await response.data;
             return data;
         }catch(e){
            if(e.response){
              console.log(e.response.data.message)
            }
         }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page


  // Fetch products and cart data on page load


  useEffect(() => {
    const onLoadHandler = async () => {

      getAddresses(token)
      const productsData = await getProducts();
      setProducts(productsData)

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Box>
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            {/* <Box>
            </Box> */}

              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
             {
               addresses?.all?.length > 0?(
                 addresses.all?.map((address) => {
                  return(
                    <Box className = {`address-item  ${address._id !== addresses.selected? "not-selected" : "selected"}`} key ={address._id} onClick = { () => handleAddressSelect(address._id)}>

                    {/* <Typography variant ="h6" className = "address-title">{address.address}</Typography> */}
                    {address.address}
                    <Button
                    startIcon ={<Delete />}
                     variant = 'text'
                     className = "delete-button"
                     onClick  ={ async() => await deleteAddress(token, address._id) }
                    >
                      DELETE
                      </Button>
                  </Box>
                  )
                  // console.log(address.address, address._id)
                 })
               ) : (  <Typography my="1rem">
                    No addresses found for this account. Please add one to proceed
             </Typography>)
             }
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
           {
             show ? '' : ( <Button
              color="primary"
              variant="contained"
              id="add-new-btn"
              size="large"
              onClick={() => {
                setNewAddress((currNewAddress) => ({
                  ...currNewAddress,
                  isAddingNewAddress: true,
                }));
                setShow(true)
              }}
            >
              Add new address
          </Button>)
           }
         {
           show ? (
            <AddNewAddressView
            token={token}
            newAddress={newAddress}
            handleNewAddress={setNewAddress}
            addAddress={addAddress}
            setShow = {setShow}
        />
           ) : ''
         }

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick = {async() => await performCheckout(token, items, addresses) }
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly = {true} products={products} items={items} />
          <Box display ="flex" flexDirection = "column" justifyContent = "space-between" className = "order-detail">
             <Typography variant = "h4" style ={{marginBottom : "30px", fontWeight : "700", fontSize : "24px"}}>Order Details</Typography>
             <Box>
             <Box display = "flex" justifyContent ="space-between" alignItems = "center" className = "details_title">
               <Typography variant = "h5" className = "order-details-title">Products</Typography>
              <Typography variant = "h5" className = "order-details-title">{items && items.length}</Typography>
              </Box>
              <Box display = "flex" justifyContent ="space-between" alignItems = "center" className = "details_title">
               <Typography variant = "h5" className = "order-details-title">Subtotals</Typography>
              <Typography variant = "h5" className = "order-details-title">${getTotalCartValue(items)}</Typography>
              </Box>
              <Box display = "flex" justifyContent ="space-between" alignItems = "center" className = "details_title">
               <Typography variant = "h5" className = "order-details-title">Shipping charge</Typography>
              <Typography variant = "h5" className = "order-details-title">{"$0"}</Typography>
              </Box>
              <Box display = "flex" justifyContent ="space-between" alignItems = "center" className = "details_title">
               <Typography variant = "h5" className = "order-details-title_total" >Total</Typography>
              <Typography variant = "h5" className = "order-details-title_total">${getTotalCartValue(items)}</Typography>
              </Box>
             </Box>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
