import { useState, useEffect } from 'react'
import { getApplications, createApplication, updateApplication, deleteApplication } from '../api/client'
import StatusBadge from '../components/StatusBadge'

function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: 'Applied',
    notes: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await getApplications()
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingApp) {
        await updateApplication(editingApp.id, form)
      } else {
        await createApplication(form)
      }
      setShowForm(false)
      setEditingApp(null)
      setForm({ company: '', role: '', status: 'Applied', notes: '' })
      fetchApplications()
    } catch (error) {
      console.error('Error saving application:', error)
    }
  }

  const handleEdit = (app) => {
    setEditingApp(app)
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      notes: app.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application?')) {
      await deleteApplication(id)
      fetchApplications()
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Applications</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Application
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingApp ? 'Edit Application' : 'New Application'}</h3>
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleSubmit}>
                {editingApp ? 'Update' : 'Save'}
              </button>
              <button className="btn-secondary" onClick={() => {
                setShowForm(false)
                setEditingApp(null)
                setForm({ company: '', role: '', status: 'Applied', notes: '' })
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="applications-grid">
        {applications.length === 0 ? (
          <p className="empty-state">No applications yet. Add your first one!</p>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <div>
                  <h3>{app.company}</h3>
                  <p>{app.role}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              {app.notes && <p className="card-notes">{app.notes}</p>}
              <div className="card-footer">
                <span className="card-date">
                  {new Date(app.date_applied).toLocaleDateString()}
                </span>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => handleEdit(app)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(app.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Applications