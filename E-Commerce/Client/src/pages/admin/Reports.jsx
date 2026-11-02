import { useEffect, useState } from "react";
import API from "../../services/api.js";
function Reports() {
  const [report, setReport] = useState([]);
  useEffect(() => {
    API.get("/admin/reports").then(({ data }) => setReport(data.report));
  }, []);
  return (
    <section>
      <p className="text-secondary text-uppercase small fw-semibold mb-1">
        Performance
      </p>
      <h1 className="mb-4">Sales reports</h1>
      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{row.orders}</td>
                <td>₹{Number(row.revenue).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default Reports;
