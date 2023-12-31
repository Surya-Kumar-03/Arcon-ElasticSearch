import { useState } from "react";
import axios from "axios";
import DisplayRes from "./DisplayRes";
import LoadingButton from "@mui/lab/LoadingButton";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";

function App() {
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({
    //input indexes here
    time: "",
    uri_path: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/search",
        formData
      );
      if (response.status === 200) {
        console.log(response.data.hits);
        setData(response.data.hits);
        setMatchCount(response.data.hits.length);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [updating, setUpdating] = useState(false);
  async function updateLogs() {
    const response = await axios.post(`http://localhost:8000/index`);
    if (response.status === 200) {
      setUpdating(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

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
          <form
            onSubmit={handleSubmit}
            className="flex flex-row flex-grow w-full justify-center items-center gap-3 flex-wrap"
          >
            {Object.entries(formData).map(([key, value]) => (
              <TextField
                key={key}
                label={key}
                name={key}
                value={value}
                onChange={handleChange}
                className="w-72"
                margin="normal"
                variant="outlined"
              />
            ))}
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              className="h-10"
            >
              Search
            </Button>
            <div className="p-3 border border-gray-300 rounded-md font-bold">
              Matches: {matchCount}
            </div>
          </form>
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
