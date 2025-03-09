import Button from "../Button/Button";
import Food from "./Food";

function Card({ food }) {
  return (
    <div className="card">
      <img className="card-image" src={food.image} alt={food.name} />
      <Food
        name={food.name}
        price={food.price}
        isHighProtein={food.isHighProtein}
      />
      <Button />
    </div>
  );
}

export default Card;
