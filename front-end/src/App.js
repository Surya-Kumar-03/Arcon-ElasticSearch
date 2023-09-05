import SearchBar from "./searchBar";
import { useState, useEffect } from "react";
import axios from "axios";
import DisplayRes from "./DisplayRes";
import LoadingButton from "@mui/lab/LoadingButton";

function App() {
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState(0);
  const [data, setData] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:8000/search?q=${search}`
      );

      if (response.status === 200) {
        console.log(response.data);
        if (response.data.hits) {
          setData(response.data.hits);
        } else setData([]);
        if (response.data.hitsCount) {
          setHits(response.data.hitsCount);
        } else {
          setHits(0);
        }
      }
    };

    const fetchTimeout = setTimeout(fetchData, 500);

    return () => {
      clearTimeout(fetchTimeout);
    };
  }, [search]);

  async function updateLogs() {
    const response = await axios.post(`http://localhost:8000/index`);
    if (response.status === 200) {
      setUpdating(false);
    }
  }

  const [deleting, setDeleting] = useState(false);

  async function deleteLogs() {
    const response = await axios.delete(`http://localhost:8000/index`);
    if (response.status === 200) {
      setDeleting(false);
    }
  }

  return (
    <div className="App">
      <div className="flex flex-col w-full min-h-screen justify-start pt-10 items-center gap-3">
        <div className="flex flex-row w-full justify-center items-center gap-3">
          <SearchBar setSearch={setSearch} search={search}></SearchBar>
          <p className="text-2xl border border-blue-300 p-2 rounded-md">
            {hits}
          </p>
        </div>
        <div className="flex flex-row w-1/2 gap-3">
          <LoadingButton
            size="large"
            color="primary"
            className="w-1/2"
            onClick={() => {
              setUpdating(true);
              updateLogs();
            }}
            loading={updating}
            loadingIndicator="Updating..."
            variant="contained"
          >
            <span>Update Logs</span>
          </LoadingButton>
          <LoadingButton
            size="large"
            color="error"
            className="w-1/2"
            onClick={() => {
              setDeleting(true);
              deleteLogs();
            }}
            loading={deleting}
            loadingIndicator="Deleting..."
            variant="contained"
          >
            <span>Delete Logs</span>
          </LoadingButton>
        </div>
        <DisplayRes data={data}></DisplayRes>
      </div>
    </div>
  );
}

export default App;
