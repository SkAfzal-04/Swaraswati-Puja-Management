import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  getParaGraph,
  getDayGraph,
  getIncomeVsExpense,
  getTopDonors,
  getDonorByDate,
  getExpenseByDate,
  getCollectionBarGraph,
} from "../../services/transactionApi";

/* =========================
   SKELETONS
========================= */
function ChartSkeleton({ type = "bar" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow animate-pulse">
      <div className="h-4 w-48 bg-gray-300 rounded mb-6" />
      <div className="h-[300px] bg-gray-100 rounded-lg p-4">
        {type === "bar" ? <BarSkeleton /> : <LineSkeleton />}
      </div>
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="flex items-end gap-3 h-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-300 rounded"
          style={{ height: `${30 + i * 10}%` }}
        />
      ))}
    </div>
  );
}

function LineSkeleton() {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <polyline
          points="0,40 20,30 40,35 60,20 80,25 100,15"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function BudgetGraphs() {
  const [loading, setLoading] = useState(true);
  const [paraData, setParaData] = useState([]);
  const [dayData, setDayData] = useState([]);
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState([]);
  const [topDonorsData, setTopDonorsData] = useState([]);
  const [donorByDateData, setDonorByDateData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [collectionBarData, setCollectionBarData] = useState([]);


  const colors = ["#4f46e5", "#f97316", "#10b981", "#e11d48", "#facc15"];

  useEffect(() => {
    fetchGraphs();
  }, []);

  const fetchGraphs = async () => {
    try {
      setLoading(true);
      const [
        para,
        day,
        incomeVsExpense,
        topDonors,
        donorByDate,
        expense,
        CollectionBarGraph
      ] = await Promise.all([
        getParaGraph(),
        getDayGraph(),
        getIncomeVsExpense(),
        getTopDonors(),
        getDonorByDate(),
        getExpenseByDate(),
        getCollectionBarGraph(),
      ]);

      setParaData(para);
      setDayData(day);
      setExpenseData(expense);
      setIncomeVsExpenseData(incomeVsExpense);
      setCollectionBarData(CollectionBarGraph);

      // Top donors
      setTopDonorsData(
        topDonors.map((d) => ({
          donor: d.name,
          total: Number(d.total) || 0,
        }))
      );

      // Donor over time
      const donorMap = {};
      donorByDate.forEach((d) => {
        if (!donorMap[d.date]) donorMap[d.date] = { date: d.date };
        donorMap[d.date][d.name] = Number(d.totalPaid) || 0;
      });
      setDonorByDateData(Object.values(donorMap));
    } catch (err) {
      console.error("Graph fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EXPENSE BY ITEM CHART
  ========================= */
  const expenseChartData = useMemo(() => {
    return expenseData.map((d, i) => ({
      id: i,
      item: d.category,
      amount: Number(d.amount) || 0,
      date: d.paidDate || null,
    }));
  }, [expenseData]);

  /* =========================
     Y-AXIS FORMATTER
  ========================= */
  const formatPrice = (v) => {
    const num = Number(v);
    if (isNaN(num)) return v;
    if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const tooltipPrice = (v) => {
    const num = Number(v);
    return isNaN(num) ? v : `₹${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* PARA */}
      {loading ? (
        <ChartSkeleton />
      ) : (
        <ChartCard title="Para-wise Collection">
          <BarChart data={paraData.map((d) => ({ ...d, total: Number(d.total) }))}>
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Bar dataKey="total">
              {paraData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      )}
      {/* COLLECTION BAR CHART */}
      {loading ? (
        <ChartSkeleton type="bar" />
      ) : (
        <ChartCard title="Total Collection (Paid Only)">
          <BarChart
            data={collectionBarData.datasets[0]?.data.map((d, i) => ({
              category: collectionBarData.labels[i],
              value: d,
            }))}
          >
            <XAxis dataKey="category" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Bar dataKey="value">
              {collectionBarData.datasets[0]?.data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      )}

      {/* DAY */}
      {loading ? (
        <ChartSkeleton type="line" />
      ) : (
        <ChartCard title="Day-wise Collection">
          <LineChart data={dayData.map((d) => ({ ...d, total: Number(d.total) }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Line dataKey="total" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ChartCard>
      )}

      {/* INCOME VS EXPENSE */}
      {loading ? (
        <ChartSkeleton type="line" />
      ) : (
        <ChartCard title="Income vs Expense">
          <LineChart
            data={incomeVsExpenseData.map((d) => ({
              date: d.date,
              income: Number(d.income) || 0,
              expense: Number(d.expense) || 0,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Legend />
            <Line dataKey="income" stroke="#10b981" />
            <Line dataKey="expense" stroke="#ef4444" />
          </LineChart>
        </ChartCard>
      )}

      {/* TOP DONORS */}
      {loading ? (
        <ChartSkeleton />
      ) : (
        <ChartCard title="Top Donors">
          <BarChart data={topDonorsData}>
            <XAxis dataKey="donor" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Bar dataKey="total" fill="#f97316" />
          </BarChart>
        </ChartCard>
      )}

      {/* DONOR OVER TIME */}
      {loading ? (
        <ChartSkeleton type="line" />
      ) : (
        <ChartCard title="Donor Contribution Over Time">
          <LineChart data={donorByDateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip formatter={tooltipPrice} />
            <Legend />
            {donorByDateData[0] &&
              Object.keys(donorByDateData[0])
                .filter((k) => k !== "date")
                .map((donor, i) => (
                  <Line
                    key={donor}
                    dataKey={donor}
                    stroke={colors[i % colors.length]}
                  />
                ))}
          </LineChart>
        </ChartCard>
      )}

      {/* EXPENSE BY ITEM */}
      {loading ? (
        <ChartSkeleton type="line" />
      ) : (
        <ChartCard title="Expense by Item">
          <LineChart data={expenseChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item" angle={-30} height={80} textAnchor="end" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const { item, amount, date } = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow text-sm">
                    <p>
                      <b>Item:</b> {item}
                    </p>
                    <p>
                      <b>Amount:</b> {tooltipPrice(amount)}
                    </p>
                    {date && (
                      <p>
                        <b>Date:</b> {new Date(date).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Line dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ChartCard>
      )}
    </div>
  );
}

/* =========================
   CARD WRAPPER
========================= */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
