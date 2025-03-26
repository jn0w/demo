function Food(props) {
  return (
    <div>
      <p>{props.name}</p>
      <p>Price is: €{props.price}</p>
      <p>Is the food high in protein: {props.isHighProtein ? "Yes" : "No"}</p>
    </div>
  );
}

export default Food;
