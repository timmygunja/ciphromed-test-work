import "./Table.css";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

const Table = () => {
  const [data, setData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [averageValue, setAverageValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("../../Данные.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);

      const parsedData = Papa.parse(csv, { header: true });
      setData(parsedData.data);

      return await parsedData.data;
    };

    fetchData();
  }, []);

  useEffect(() => {
    let total = 0;
    data
      .filter((row) => row.Год === "2023")
      .map((row) => (total += parseInt(row.Показатель)));

    const average = Math.round(
      total / data.filter((row) => row.Год === "2023").length
    );

    setAverageValue(average);
  }, [data]);

  useEffect(() => {
    const selectedData = data.filter((row) => row.Регион === selectedRegion);

    const years = selectedData.map((row) => row.Год);
    const values = selectedData.map((row) => row.Показатель);

    const grapharea = document.getElementById("lineChart");

    let myChart = new Chart(grapharea, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: selectedRegion,
            data: values,
            borderColor: "blue",
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    let curr =
      selectedData.reduce((total, row) => {
        if (row.Год === "2023") {
          return total + parseFloat(row.Показатель);
        } else {
          return total;
        }
      }, 0) / selectedData.filter((row) => row.Год === "2023").length;

    setCurrentValue(curr);

    return () => {
      myChart.destroy();
    };
  }, [selectedRegion, data]);

  const regions = [...new Set(data.map((row) => row.Регион))];

  return (
    <div className="container">
      <div className="chart">
        <canvas id="lineChart" />
      </div>

      <div className="info">
        <p
          style={{
            color: currentValue > averageValue ? "green" : "red",
          }}
        >
          Средний Показатель по региону "{selectedRegion}" за 2023 Год:{" "}
          {currentValue}
        </p>
        <p>
          Средний Показатель по России за 2023 Год:
          {averageValue}
        </p>
      </div>

      <div className="table">
        <select onChange={(e) => setSelectedRegion(e.target.value)}>
          <option value="">Выбрать Регион</option>
          {regions.map((region, index) => (
            <option key={index} value={region}>
              {region}
            </option>
          ))}
        </select>
        <button onClick={() => setSelectedRegion("")}>Сбросить</button>
        <div>
          <table>
            <thead>
              <tr>
                <th>Регион</th>
                <th>Год</th>
                <th>Показатель</th>
              </tr>
            </thead>
            <tbody>
              {data.map(
                (row, index) =>
                  (selectedRegion === "" || row.Регион === selectedRegion) && (
                    <tr key={index}>
                      <td>{row.Регион}</td>
                      <td className="table-year">{row.Год}</td>
                      <td className="table-value">{row.Показатель}</td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
