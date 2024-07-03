import React, { useState, useEffect } from "react";
import SearchBar from "./components/searchBar";
import { fetchData } from "./services/api";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const apiUrl =
      "https://fe-take-home-assignment.s3.us-east-2.amazonaws.com/Data.json";
    fetchData(apiUrl)
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="App">
      <SearchBar
        users={users}
        onSelectUser={handleSelectUser}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default App;
