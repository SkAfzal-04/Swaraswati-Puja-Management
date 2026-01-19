import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function BudgetGraphs({ paraData }) {
  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold mb-4">Para-wise Collection</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={paraData}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
