import axios from "axios";

export const getTournaments = async () => {
  const response = await axios.get("/api/tournaments", {});
  return response.data;
};

export const getTournamentById = async (id) => {
  const response = await axios.get(`/api/tournaments/${id}`, {});
  return response.data;
};

export const joinTournament = async (tournament_id, uid) => {
  try {
    const response = await axios.put(`/api/tournaments/${tournament_id}/join`, {
      uid,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const addPosition = async (tournament_id, position) => {
  // transform the position array into an object
  const positionObj = {
    start_time: position[0],
    open_price: position[1],
    amount: position[2],
    close_price: position[3],
    type: position[4],
    status: position[3] === 0 ? "open" : "closed",
  };

  const response = await axios.put(
    `/api/tournaments/${tournament_id}/addPosition`,
    {
      uid: position[5],
      position: positionObj,
    }
  );
  return response.data;
};

export const closePositionOnServer = async (tournament_id, position) => {
  const positionObj = {
    start_time: position[0],
    open_price: position[1],
    amount: position[2],
    close_price: position[3],
    type: position[4],
    status: "closed",
  };

  const response = await axios.put(
    `/api/tournaments/${tournament_id}/closePosition`,
    {
      uid: position[5],
      position: positionObj,
    }
  );
  return response.data;
};

export const updatePlayerTournamentBalance = async (
  tournamentId,
  uid,
  newBalance
) => {
  try {
    const response = await axios.put(
      `/api/tournaments/${tournamentId}/players/${uid}/updateBalance`,
      {
        newBalance,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating player balance", error);
    throw error;
  }
};
