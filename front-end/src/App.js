import SearchBar from "./searchBar";
import { useState, useEffect } from "react";
import axios from "axios";
import DisplayRes from "./DisplayRes";

function App() {
  const [search, setSearch] = useState("");
  const [hits, setHits] = useState(0);
  const [data, setData] = useState([]);
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

  return (
    <div className="App">
      <div className="flex flex-col w-full min-h-screen justify-start pt-10 items-center">
        <div className="flex flex-row w-full justify-center items-center">
          <SearchBar setSearch={setSearch} search={search}></SearchBar>
          <p className="text-2xl border border-blue-300 p-2 rounded-md ml-3">
            {hits}
          </p>
        </div>
        <DisplayRes data={data}></DisplayRes>
      </div>
    </div>
  );
}

export default App;
