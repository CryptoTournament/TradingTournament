import React from "react";

const UserContext = React.createContext({
  navBarDisplayName: "",
  color: "",
  userBalance: 0,
});

export default UserContext;
