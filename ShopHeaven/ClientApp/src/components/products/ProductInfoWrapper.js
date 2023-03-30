import { React } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../theme";
import ImageCarousel from "./ImageCarousel";
import ProductDescription from "./ProductDescription";
import ProductActionButtons from "./ProductActionButtons";

export default function ProductInfoWrapper(props) {
  const ContentWrapper = styled(Box)({
    display: "flex",
  });

  const StyledPaper = styled(Paper)({
    padding: theme.spacing(3),
  });

  const MainWrapper = styled(Box)({
    width: "80%",
    margin: "auto",
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      width: "95%",
    },
  });

  const ProductName = styled(Typography)({
    marginBottom: theme.spacing(2),
  });

  return (
    <MainWrapper>
      <ContentWrapper>
        <StyledPaper>
          <ProductName variant="h4">{props.product.name}</ProductName>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Box>
                {
                  // first important part of the page
                }
                <ImageCarousel images={props.product.images} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={5} sx={{ position: "relative" }}>
              {
                // second important part of the page
              }
              <ProductDescription product={props.product} />
            </Grid>

            <Grid item xs={12} md={12} lg={3}>
              {
                // third important part of the page
              }
              <ProductActionButtons product={props.product}/>
            </Grid>
          </Grid>
        </StyledPaper>
      </ContentWrapper>
    </MainWrapper>
  );
}