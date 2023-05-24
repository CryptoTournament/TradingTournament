import React from "react";

const Shop = () => {
  const products = [
    {
      name: "Access To VIP Tournaments",
      description: "Gain access to luxury, vip only tournaments.",
      price: 100,
      image: `/images/store/vip.png`, // replace with the path to your image
    },
    {
      name: "Player Name Color Change",
      description: "Change the color of your player name.",
      price: 200,
      image: `/images/store/Playernamecolourchange.png`, // replace with the path to your image
    },
    // add more products here
  ];

  const userTokens = 500; // replace this with the actual value

  return (
    <div className="p-6 md:p-12 min-h-screen">
      <div className="sticky md:relative top-0 z-50 flex justify-between items-center bg-gradient-to-r from-black to-gray-800  p-4 shadow-md ">
        <h1 className="text-2xl font-bold text-white">Shop</h1>
        <p className="text-xl text-white">{userTokens} Tokens</p>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-black to-gray-800 shadow-md rounded-lg p-6"
          >
            <img
              className="w-full h-64 object-contain scale-125 rounded-t-lg mb-4"
              src={product.image}
              alt={product.name}
            />
            <h2 className="text-xl font-semibold mb-2 text-indigo-500">
              {product.name}
            </h2>
            <p className="text-gray-400 mb-3">{product.description}</p>
            <p className="text-gray-400 font-bold">{product.price} Tokens</p>
            <button className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-800">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
