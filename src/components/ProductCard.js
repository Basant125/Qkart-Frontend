import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart , updateCart, products,token}) => {
  const { _id, name, category, cost, rating, image } = product;
  return (
    <Card className="card" id={name}>
      <CardMedia component="img" image={image} alt={name} aria-label ="stars"></CardMedia>
      <CardContent> 
        <Typography className="product_title" variant="span">
          {name}
        </Typography>
        <Typography className="product_cost" variant="h6">
          ${cost}
        </Typography>
        <Rating name="stars" value={rating} className = "rating"></Rating>
      </CardContent>
      <CardActions>
        <Button variant="contained" role="button" fullWidth onClick = { async() =>  await handleAddToCart(token,updateCart,products,_id,1,true)}>
          <AddShoppingCartOutlined /> ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

//  handleAddToCart(token,cartProducts,products,_id,1,{preventDuplicate:true})
