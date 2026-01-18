export default function ExportCSV({ members }) {
  const exportCSV = () => {
    const headers = Object.keys(members[0]).join(",")
    const rows = members.map(m => Object.values(m).join(","))
    const csv = [headers, ...rows].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "members.csv"
    a.click()
  }

  return (
    <button
      onClick={exportCSV}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Export CSV
    </button>
  )
}
