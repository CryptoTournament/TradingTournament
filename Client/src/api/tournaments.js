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
  const response = await axios.put(`/api/tournaments/${tournament_id}/join`, {
    uid,
  });
  return response.data;
};
