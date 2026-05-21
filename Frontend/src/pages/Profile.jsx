import { useState, useEffect } from 'react'
import { getProfile, updateProfile, changePassword } from '../api/client'
import { useAuth } from '../context/AuthContext'

// Reusable tag input
function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState('')
  const add = (val) => {
    const trimmed = val.trim()
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed])
    setInput('')
  }
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
    if (e.key === 'Backspace' && !input) setTags(tags.slice(0, -1))
  }
  return (
    <div className="tag-input-wrap">
      {tags.map(t => (
        <span key={t} className="tag">
          {t}
          <button type="button" onClick={() => setTags(tags.filter(x => x !== t))}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input.trim() && add(input)}
        placeholder={placeholder}
      />
    </div>
  )
}

const WORK_TYPES = ['Remote', 'Hybrid', 'On-site', 'Open to all']

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('info')

  // Edit state
  const [form, setForm] = useState({})
  const [skills, setSkills] = useState([])
  const [targetRoles, setTargetRoles] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    getProfile().then(res => {
      const p = res.data
      setProfile(p)
      setForm({
        full_name: p.full_name || '',
        current_title: p.current_title || '',
        location: p.location || '',
        years_experience: p.years_experience ?? '',
        degree: p.degree || '',
        field_of_study: p.field_of_study || '',
        institution: p.institution || '',
        work_type: p.work_type || '',
        salary_min: p.salary_min || '',
        salary_max: p.salary_max || '',
        linkedin_url: p.linkedin_url || '',
      })
      setSkills(p.skills || [])
      setTargetRoles(p.target_roles || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      await updateProfile({
        ...form,
        years_experience: form.years_experience !== '' ? parseInt(form.years_experience) : null,
        salary_min: form.salary_min !== '' ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max !== '' ? parseInt(form.salary_max) : null,
        skills,
        target_roles: targetRoles,
      })
      setSaveMsg('Profile updated successfully!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.next.length < 6) return setPwError('New password must be at least 6 characters.')
    if (pwForm.next !== pwForm.confirm) return setPwError('Passwords do not match.')
    setPwLoading(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      setPwSuccess('Password changed successfully!')
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSuccess(''), 4000)
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) return <div className="page"><p>Loading...</p></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p style={{ color: '#8b7260', fontSize: '0.9rem', marginTop: '0.2rem' }}>{user?.email}</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {[
          { key: 'info', label: '👤 Personal Info' },
          { key: 'job', label: '🎯 Job Preferences' },
          { key: 'password', label: '🔒 Change Password' },
        ].map(tab => (
          <button
            key={tab.key}
            className={activeSection === tab.key ? 'tab active' : 'tab'}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info + Education */}
      {activeSection === 'info' && (
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-section-card">
            <h3 className="profile-section-title">Personal Details</h3>
            <div className="profile-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Current Title</label>
                <input value={form.current_title} onChange={e => setForm({ ...form, current_title: e.target.value })} placeholder="e.g. Data Scientist" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Melbourne, Australia" />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" min="0" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>LinkedIn URL</label>
                <input value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourname" />
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <h3 className="profile-section-title">Education</h3>
            <div className="profile-grid">
              <div className="form-group">
                <label>Degree</label>
                <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} placeholder="e.g. Master of Data Science" />
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input value={form.field_of_study} onChange={e => setForm({ ...form, field_of_study: e.target.value })} placeholder="e.g. Data Science" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Institution</label>
                <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="e.g. Deakin University" />
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <h3 className="profile-section-title">Skills</h3>
            <div className="form-group">
              <label>Your Skills</label>
              <TagInput tags={skills} setTags={setSkills} placeholder="Type a skill and press Enter" />
              <p className="form-hint">Press Enter or comma to add a skill</p>
            </div>
          </div>

          <div className="profile-save-row">
            {saveMsg && <span className={saveMsg.includes('success') ? 'save-success' : 'save-error'}>{saveMsg}</span>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Job Preferences */}
      {activeSection === 'job' && (
        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-section-card">
            <h3 className="profile-section-title">Target Roles</h3>
            <div className="form-group">
              <label>Roles you're targeting</label>
              <TagInput tags={targetRoles} setTags={setTargetRoles} placeholder="e.g. Data Engineer" />
              <p className="form-hint">Press Enter or comma to add a role</p>
            </div>
          </div>

          <div className="profile-section-card">
            <h3 className="profile-section-title">Work Preferences</h3>
            <div className="form-group">
              <label>Work Type</label>
              <div className="work-type-pills">
                {WORK_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`pill ${form.work_type === type ? 'pill-active' : ''}`}
                    onClick={() => setForm({ ...form, work_type: form.work_type === type ? '' : type })}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Min Salary (AUD)</label>
                <input type="number" value={form.salary_min} onChange={e => setForm({ ...form, salary_min: e.target.value })} placeholder="e.g. 80000" />
              </div>
              <div className="form-group">
                <label>Max Salary (AUD)</label>
                <input type="number" value={form.salary_max} onChange={e => setForm({ ...form, salary_max: e.target.value })} placeholder="e.g. 120000" />
              </div>
            </div>
          </div>

          <div className="profile-save-row">
            {saveMsg && <span className={saveMsg.includes('success') ? 'save-success' : 'save-error'}>{saveMsg}</span>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Change Password */}
      {activeSection === 'password' && (
        <div className="profile-section-card" style={{ maxWidth: '480px' }}>
          <h3 className="profile-section-title">Change Password</h3>
          <form onSubmit={handleChangePassword} className="profile-form">
            {pwError && <div className="auth-error">{pwError}</div>}
            {pwSuccess && <div className="auth-success">{pwSuccess}</div>}
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
