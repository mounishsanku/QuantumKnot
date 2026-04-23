export default function CityHeatmap({ data }) {
  return (
    <div className="p-4 rounded-xl bg-black/40 border border-gray-700 text-white">
      <h2 className="text-lg font-bold mb-3">🌍 Impact Map</h2>

      {Object.entries(data).map(([city, count]) => (
        <div key={city} className="flex justify-between text-sm mb-1">
          <span>{city}</span>
          <span className="text-red-400">{count} riders</span>
        </div>
      ))}
    </div>
  );
}
