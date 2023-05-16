import { React, Fragment } from "react";
import CategorySubcategoriesRow from "./CategorySubcategoriesRow";

export default function CategorySubcategories(props) {

  return (
    <Fragment>
      {props.subcategories?.map((subcategory) => (
         <CategorySubcategoriesRow key={subcategory?.id} subcategory={subcategory} />
      ))}
    </Fragment>
  );
}