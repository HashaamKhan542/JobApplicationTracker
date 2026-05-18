function StatusBadge({ status }) {
  const getColor = (status) => {
    switch (status) {
      case 'Applied': return 'badge-blue'
      case 'Interviewing': return 'badge-yellow'
      case 'Offer': return 'badge-green'
      case 'Rejected': return 'badge-red'
      default: return 'badge-blue'
    }
  }

  return (
    <span className={`badge ${getColor(status)}`}>
      {status}
    </span>
  )
}

export default StatusBadge