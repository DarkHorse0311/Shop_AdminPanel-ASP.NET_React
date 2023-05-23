import { React, useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TableRow,
  TableCell,
  Collapse,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  Pagination,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../../theme";
import { RemoveCircle, AddCircle, Search, Cancel } from "@mui/icons-material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { ApiEndpoints } from "../../../api/endpoints";
import CreateProduct from "./CreateProduct";
import ProductRow from "./ProductRow";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminProducts() {
  const [showCreateProduct, setShowCreateProduct] = useState(false);

  const [products, setProducts] = useState();
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const axiosPrivate = useAxiosPrivate();

  const effectRun = useRef(false);

  const searchInputRef = useRef();
  const categorySearchRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const getProducts = async () => {
      try {
          const response = await axiosPrivate.get(
          ApiEndpoints.products.getAllWithCreationInfo,
          {
            signal: controller.signal,
          }
        );

        console.log(response?.data);

        setCategories(response?.data?.categories);
        setProducts(response?.data?.products);
        setCurrencies(response?.data?.currencies);
      } catch (error) {
        console.log(error);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    if (effectRun.current) {
      getProducts();
    }

    return () => {
      effectRun.current = true; // update the value of effectRun to true
      controller.abort();
    };
  }, []);

  function clearSearchValue() {
    searchInputRef.current.value = "";
  }

  function handleShowCreateProduct() {
    setShowCreateProduct((prev) => !prev);
  }

  function productListChanged(newProduct) {
    setProducts((prev) => [...prev, newProduct]);
  }

  const MainCategoryTableCell = styled(TableCell)({
    fontSize: 18,
  });

  const StyledButtonBox = styled(Box)({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  });

  const StyledPagination = styled(Pagination)({});

  const PaginationHolder = styled(Box)({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
  });

  const SearchInput = styled("input")({
    position: "relative",
    width: "100%",
    border: "1px solid #C6BFBE",
    backgroundColor: "rgb(255,249,249)",
    padding: theme.spacing(0.65),
    paddingLeft: theme.spacing(5),
    borderRadius: theme.shape.borderRadius,
  });

  const StyledSelect = {
    cursor: "pointer",
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    border: "1px solid #C6BFBE",
    textTransform: "uppercase",
    fontSize: 14,
    backgroundColor: "rgb(255,249,249)",
  };

  const CancelButton = styled(Cancel)({
    position: "absolute",
    right: 5,
    top: 22,
    "&:hover": {
      color: theme.palette.primary.main,
      cursor: "pointer",
    },
  });

  const StyledSearchIcon = styled(Search)({
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: "40px",
    position: "absolute",
    zIndex: 1,
  });

  function onSearchProduct(e){
    e.preventDefault();

    const searchValue = searchInputRef.current.value;
    const categoryId = categorySearchRef.current.value;

    if (!searchValue.trim() || !categoryId.trim()) {
      return;
    }

    var filtered = products.filter((x) => x.name.toLowerCase().includes(searchValue.toLowerCase()));
    setProducts(filtered);

    console.log(searchValue, categoryId);
  }

  return (
    <Box>
      <form onSubmit={onSearchProduct}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={7} lg={7} sx={{ position: "relative" }}>
            <StyledSearchIcon />
            <SearchInput ref={searchInputRef} placeholder="Search product..." />
            <CancelButton onClick={clearSearchValue} />
        </Grid>
        <Grid item xs={8} sm={8} md={3} lg={4}>
          <select
            style={StyledSelect}
            ref={categorySearchRef}
            name="category"
          >
            {categories?.map((cat) => (
              <option key={cat?.id} value={cat?.id}>
                {cat?.name}
              </option>
            ))}
          </select>
        </Grid>
        <Grid item xs={4} sm={4} md={2} lg={1}>
       <Button sx={{width: "100%", fontSize: 13}} variant="contained" type="submit" color="primary">
         SEARCH
       </Button>
        </Grid>
      </Grid>
      </form>
      <TableContainer component={Box}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "20px",
                  padding: 0,
                  paddingLeft: theme.spacing(1),
                }}
              />
              <MainCategoryTableCell></MainCategoryTableCell>
              <MainCategoryTableCell align="center"></MainCategoryTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product, index) => {
              return (
                <ProductRow
                  key={index}
                  categories={categories}
                  currencies={currencies}
                  product={product}
                />
              );
            })}
          </TableBody>
        </Table>
        <StyledButtonBox>
          {showCreateProduct ? (
            <Button
              onClick={handleShowCreateProduct}
              variant="contained"
              size="small"
              startIcon={<RemoveCircle />}
            >
              HIDE CREATION FORM
            </Button>
          ) : (
            <Button
              onClick={handleShowCreateProduct}
              variant="contained"
              size="small"
              startIcon={<AddCircle />}
            >
              ADD NEW PRODUCT
            </Button>
          )}
        </StyledButtonBox>
      </TableContainer>
      <Collapse in={showCreateProduct} timeout="auto" unmountOnExit>
        <CreateProduct
          productListChanged={productListChanged}
          categories={categories}
          currencies={currencies}
        />
      </Collapse>
      <PaginationHolder>
        <StyledPagination count={10} size="medium" color="secondary" />
      </PaginationHolder>
    </Box>
  );
}
