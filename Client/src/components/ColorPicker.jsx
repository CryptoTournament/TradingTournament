import React from "react";
import { useState, useContext, useEffect } from "react";
import { buyColorChangeProduct } from "../api/users";
import UserContext from "../contexts/UserContext";
import { getProductByName } from "../api/products";

const ColorPicker = ({ displayName, onClose, uid }) => {
  const { setColor, setUserBalance, userBalance } = useContext(UserContext);
  const [localDisplayColor, setLocalDisplayColor] = useState("gray-900");
  const [selectedColor, setSelectedColor] = useState(null);
  const [product, setProduct] = useState(null);

  const colors = ["red-500", "blue-500", "gray-500", "indigo-500"];
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProductByName("Player Name Color Change");
        setProduct(product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, []);
  const handleColorSelection = (color) => {
    setLocalDisplayColor(color);
    setSelectedColor(color);
  };

  const handleBuyButtonClick = async () => {
    if (selectedColor) {
      // Perform buy action here
      // You can pass the selectedColor and price to the parent component using the setColor function and perform any necessary actions.
      await buyColorChangeProduct(uid, localDisplayColor);
      setColor(localDisplayColor);
      setUserBalance(userBalance - product.price);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div
        className="bg-white p-6 rounded-lg z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          className={`text-2xl font-bold mb-4 text-center text-${localDisplayColor}`}
        >
          {displayName}
        </h1>
        <div className="grid grid-cols-4 gap-4 md:grid-cols-4">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-12 h-12 m-2 rounded cursor-pointer bg-${color} ${
                selectedColor === color ? "border-4 border-blue-500" : ""
              }`}
              onClick={() => handleColorSelection(color)}
            ></div>
          ))}
        </div>
        {selectedColor && (
          <div className="mt-4">
            <button
              className="bg-green-900 text-white rounded px-4 py-2 w-full"
              onClick={handleBuyButtonClick}
            >
              {`Buy: ${product && product.price}$`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
