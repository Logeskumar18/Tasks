function StatCard({ label, value, note }) {
  return <article className="card bg-dark border-secondary h-100"><div className="card-body"><p className="text-secondary mb-2">{label}</p><strong className="fs-3 d-block">{value}</strong><small className="text-secondary">{note}</small></div></article>
}

export default StatCard
