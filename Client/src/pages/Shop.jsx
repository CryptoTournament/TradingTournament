import React, { useState, useEffect, useContext } from "react";
import useUser from "../hooks/useUser";
import UserContext from "../contexts/UserContext";
import ColorPicker from "../components/ColorPicker";
import { getUser } from "../api/users";
import { getAllProducts } from "../api/products";
import { upgradeToVip } from "../api/users";
import { getProductByName } from "../api/products";

const Shop = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useUser();
  const { userBalance, setUserBalance, color, setColor, navBarDisplayName } =
    useContext(UserContext);

  const [userDetails, setUserDetails] = useState({
    displayName: "",
    level: "",
    rank: "",
    winLoseRatio: "",
    balance: 0,
    displayColor: "",
    accountType: "",
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      try {
        const response = await getUser(user.uid);
        setUserDetails(response);
        setUserBalance(response.balance);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleProductPurchase = async (productName) => {
    switch (productName) {
      case "Player Name Color Change":
        setShowColorPicker(true);
        break;
      case "VIP Upgrade":
        const vipUpgradeProduct = await getProductByName("VIP Upgrade");
        if (
          vipUpgradeProduct &&
          userBalance >= vipUpgradeProduct.price &&
          userDetails.accountType !== "VIP"
        ) {
          setSelectedProduct(vipUpgradeProduct);
          setShowConfirmation(true);
        }
        break;
      default:
        break;
    }
  };

  const handleConfirmUpgrade = async () => {
    if (selectedProduct) {
      await upgradeToVip(user.uid);
      setUserBalance(userBalance - selectedProduct.price);
      setUserDetails((prevUserDetails) => ({
        ...prevUserDetails,
        accountType: "VIP",
      }));
    }
    setShowConfirmation(false);
  };

  const handleCancelUpgrade = () => {
    setSelectedProduct(null);
    setShowConfirmation(false);
  };

  const userTokens = userBalance ? userBalance : 0;

  return (
    <div className="p-6 md:p-12 min-h-screen">
      <div className="sticky md:relative top-0 z-50 flex justify-between items-center bg-gradient-to-r from-black to-gray-800  p-4 shadow-md ">
        <h1 className="text-2xl font-bold text-white">Shop</h1>
        <p className="text-xl text-white">{userTokens} Tokens</p>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products
          .filter(
            (product) =>
              product.name !== "VIP Upgrade" ||
              userDetails.accountType !== "VIP"
          )
          .map((product, index) => {
            const isDisabled = product.price > userTokens;
            return (
              <div
                key={index}
                className="bg-gradient-to-r from-black to-gray-800 shadow-md rounded-lg p-6"
              >
                <img
                  className="w-full h-64 object-contain scale-125 rounded-t-lg mb-4"
                  src={product.imagePath}
                  alt={product.imagePath}
                />
                <h2 className="text-xl font-semibold mb-2 text-indigo-500">
                  {product.name}
                </h2>
                <p className="text-gray-400 mb-3">{product.description}</p>
                <p className="text-gray-400 font-bold">
                  {product.price} Tokens
                </p>
                <button
                  className={`mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-800 ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleProductPurchase(product.name)}
                  disabled={isDisabled}
                >
                  {isDisabled ? "Not Enough Tokens" : "Buy Now"}
                </button>
              </div>
            );
          })}
        {showColorPicker && user && (
          <ColorPicker
            displayName={userDetails.displayName}
            onClose={() => setShowColorPicker(false)}
            uid={user.uid}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-75">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Upgrade</h2>
            <p className="mb-4">
              Are you sure you want to upgrade to VIP for{" "}
              {selectedProduct && selectedProduct.price} Tokens?
            </p>
            <div className="flex justify-end">
              <button
                className="mr-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-800"
                onClick={handleConfirmUpgrade}
              >
                Confirm
              </button>
              <button
                className="bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-500"
                onClick={handleCancelUpgrade}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
