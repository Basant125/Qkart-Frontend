import { Search, SentimentDissatisfied, Clear } from "@mui/icons-material";
// import ClearIcon from '@mui/icons-material/Clear';
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Avatar, Button, Stack } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from './Cart'
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {generateCartItemsFrom, getTotalCartValue} from './Cart';
import { prototype } from "events";


const Products = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(true);
  const [username, setUsername] = useState("");
  const [products, setProducts] = useState("");
  const [cartProducts, setCartProducts] = useState("");
  const [updateCart, setUpdateCart] = useState('');
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(null);
  // const [itemCount, setItemCount] = useState('');

  let navigate = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  // const product=
  // {
  // "name":"Tan Leatherette Weekender Duffle",
  // "category":"Fashion",
  // "cost":150,
  // "rating":4,
  // "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  // "_id":"PmInA797xJhMIPti"
  // }

  

  const loginHandle = () => {
    navigate.push("/login");
  };

  const registereHandle = () => {
    navigate.push("/register");
  };

  const logoutHandle = () => {
    window.location.reload();
    localStorage.clear();
    // navigate.push('/login')
  };

  const getUser = () => {
    const name = localStorage.getItem("username");
    if (name) {
      const userName = name;
      setUsername(userName);
      setShow(true);
    }
  };

  useEffect(() => {
    getUser();
  }, [username]);

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

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it


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
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const url = `${config.endpoint}/products`;
  const performAPICall = async () => {
    try {
      const response = await axios.get(url);
      const data = await response.data;
      setProducts(data);
      // console.log(data[0]._id)
      if (response.status === 200) {
        setProgress(false);
      }
    } catch {
      console.log("error in request");
    }
  };

  useEffect(() => {
    performAPICall();
  }, []);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchText(value);
      debounceSearch(value, 500);
    }
  };

  const performSearch = async (text) => {
    try {
      const response = await axios.get(`${url}/search?value=${text}`);
      const data = await response.data;
      setProducts(data);
      setError(false);
    } catch {
      setError(true);
    }
  };

  // useEffect(() =>{
  //    clearTimeout(timer);
  //    const newTime = setTimeout(()=>{
  //     performSearch(searchText);
  //    },500)

  //    setTimer(newTime)
  // }, [searchText])

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(timer);

    const newTime = setTimeout(() => {
      performSearch(event);
    }, debounceTimeout);

    setTimer(newTime);
  };

  
  /* /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
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



 


  const CartUrl = `${config.endpoint}/cart`
  const fetchCart = async (token) => {
    if (!token) return;

    try {

      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
     const format = {
       "productId":"TwMM4OAhmK0VQ93S","qty":1
      }
      // {
      //   "productId":"PmInA797xJhMIPti","qty":2
      //  },
      //  {
      //   "productId":"TwMM4OAhmK0VQ93S","qty":1
      //  },
      //  {
      //   "productId":"KCRwjF7lN97HnEaY","qty":4
      //  },
      
     
      const response = await axios.get(CartUrl,{ headers: { 
        "Authorization" : `Bearer ${token}`,
      }});

       const data = await response.data;
       setCartProducts(data);

       return data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  let token  = localStorage.getItem("token");
 
  useEffect(() =>{fetchCart(token)}, [])

 

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
 
  const isItemInCart = (items, productId) => {
    if (items?.filter(item => item.productId === productId).length > 0){
      return true;
    }
    return false;
  };


//  const handleQuantity = async(token,items,products,productId,qty) =>{
 

//   let product = items.filter((item) => item.productId === productId);
//   if(product[0].qty > 1){
//   setUpdateCart(items.map((item) => item.productId === product.productId ? {...item, qty:qty} :  item))

    
//   }else{ 

//     setUpdateCart(items.map((item) => item.productId === product.productId ? {...item, qty:qty} :  item))
  
//     if(product.qty <=1){
//       setUpdateCart(items.filter((item) => item.productId !== productId))
//       // setCartProducts(cartProducts.filter((item) => item.productId !== productId))

//     }
//   }
        
//  } 

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */



  
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    const check =  isItemInCart(items, productId)

  
    if(!token){
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
    }

    if(check && options){
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning", type : "alert"});
    }

  
    if(qty<1){
      // setUpdateCart(items.filter((item) => item.productId !== productId))
      setCartProducts(cartProducts.filter((item) => item.productId !== productId))
    }


      try{    
        const product = {"productId" : productId,"qty": qty,}
        const req = await axios.post(CartUrl, product,
        {headers:{
          "Authorization" : `Bearer ${localStorage.getItem("token")}`,
          "Content-Type" : "application/json"
        }})

        const Data = await req.data;
       
        setCartProducts(Data);
          }catch(e){
            console.log(e);
          }

     
  };

  const handleCart = (cartProducts, products) => {
    const items =  generateCartItemsFrom(cartProducts, products)
   setUpdateCart(items)
  }

useEffect(() => {
  handleCart(cartProducts, products)
}, [cartProducts])

  // const items = generateCartItemsFrom(cartProducts, products)
  //   // setCartProducts(items)
  //   getTotalCartValue(items);
 

  return (
    <>
      <Box className="header-auth">
        <Box className="header-title">
          <img src="logo_light.svg" alt="crio.do"></img>
          <a href="crio.do" />
        </Box>
        <Box className="search-desktop">
          <TextField
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={handleSearch}
          />
        </Box>

        {show ? (
          <Box className="logged">
            {/* <span><Avatar alt="crio.do" className ="avatar"/> {username}</span> */}
            <span>
              <Avatar alt="crio.do" className="avatar" /> {username}
            </span>
            <Button
              className="logout-button"
              // startIcon={<ArrowBackIcon />}
              variant="text"
              onClick={logoutHandle}
            >
              LOGOUT
            </Button>
          </Box>
        ) : (
          <Box className="login-register">
            <Button
              className="login-button"
              // startIcon={<ArrowBackIcon />}
              variant="outlined"
              onClick={loginHandle}
            >
              LOGIN
            </Button>
            <Button
              className="register-button"
              // startIcon={<ArrowBackIcon />}
              variant="contained"
              onClick={registereHandle}
            >
              REGISTER
            </Button>
          </Box>
        )}
      </Box>

      {/* <Header> */}
      {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      {/* </Header> */}

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories" 
        name="search"
        onChange={handleSearch}
      />
      <Grid container spacing = {2}  style = {{marginBottom : "100px"}} className = "product-content">
        <Grid item   lg = {show ? 9 : 12}>
          <Grid container spacing = {2}>
          <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>

         {error ? (
          <Grid item className="no-product">
            <Box className="no-product-bx">
              <SentimentVeryDissatisfiedIcon /> <span>No products found</span>
            </Box>
          </Grid>
        ) : progress ? (
          <Grid item   className="progress">
            <CircularProgress className="progress_bar" />
            <span>Loading products...</span>
          </Grid>
        ) : (
          products?.length > 0 &&
          products.map((product) => {
            return (
                <Grid item lg ={3} md={4} xs={6} key={product._id}>
                <ProductCard product={product} handleAddToCart = {addToCart}  updateCart = {updateCart}  products = {products} token = {token}/>
             </Grid>
            );
          })
        )}
          </Grid>
        </Grid>
      
          {
            show ? (<Grid item  lg ={show ? 3 : ''} sm ={12} >
               <Grid container spacing = {1}>
                 <Grid item  sm ={12}><Cart  products = {products} items = {updateCart}  handleQuantity ={addToCart} token = {localStorage.getItem("token")}/></Grid>
               </Grid>
            </Grid>) : ''
          }
         
      </Grid>
      <Footer />
    </>
  );
};

export default Products
