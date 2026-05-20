import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupProfile } from '../api/client'
import { useAuth } from '../context/AuthContext'

const WORK_TYPES = ['Remote', 'Hybrid', 'On-site', 'Open to all']
const DEGREES = ['High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD', 'Bootcamp / Certification', 'Self-taught']

const STEP_TITLES = [
  'Basic Information',
  'Experience & Skills',
  'Education',
  'Job Preferences',
]

const STEP_SUBTITLES = [
  'Tell us a bit about yourself',
  'What have you worked on and what can you do?',
  'Your educational background',
  'What kind of role are you looking for?',
]

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const addTag = (value) => {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div className="tag-input-wrapper">
      <div className="tags-container">
        {tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="tag-remove">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-text-input"
        />
      </div>
      <p className="tag-hint">Press Enter or comma to add</p>
    </div>
  )
}

export default function ProfileSetup() {
  const { markProfileComplete } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    current_title: '',
    location: '',
    years_experience: '',
    skills: [],
    degree: '',
    field_of_study: '',
    institution: '',
    target_roles: [],
    work_type: '',
    salary_min: '',
    salary_max: '',
    linkedin_url: '',
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const canAdvance = () => {
    if (step === 0) return form.full_name.trim().length > 0
    if (step === 1) return form.skills.length > 0
    return true
  }

  const handleNext = () => {
    if (step < STEP_TITLES.length - 1) {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      }
      await setupProfile(payload)
      markProfileComplete()
      navigate('/applications')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.')
      setSaving(false)
    }
  }

  const progress = ((step + 1) / STEP_TITLES.length) * 100

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-header">
          <h1>JobTracker</h1>
          <p className="setup-step-label">Step {step + 1} of {STEP_TITLES.length}</p>
          <div className="setup-progress-bar">
            <div className="setup-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <h2>{STEP_TITLES[step]}</h2>
          <p className="setup-subtitle">{STEP_SUBTITLES[step]}</p>
        </div>

        <div className="setup-body">
          {error && <div className="auth-error">{error}</div>}

          {step === 0 && (
            <div className="setup-fields">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Current Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={form.current_title}
                  onChange={e => set('current_title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={form.linkedin_url}
                  onChange={e => set('linkedin_url', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="setup-fields">
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 3"
                  value={form.years_experience}
                  onChange={e => set('years_experience', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Skills <span className="required">*</span></label>
                <TagInput
                  tags={form.skills}
                  onChange={tags => set('skills', tags)}
                  placeholder="e.g. Python, React, SQL..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-fields">
              <div className="form-group">
                <label>Highest Degree</label>
                <select value={form.degree} onChange={e => set('degree', e.target.value)}>
                  <option value="">Select degree...</option>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.field_of_study}
                  onChange={e => set('field_of_study', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  placeholder="e.g. MIT"
                  value={form.institution}
                  onChange={e => set('institution', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-fields">
              <div className="form-group">
                <label>Target Roles</label>
                <TagInput
                  tags={form.target_roles}
                  onChange={tags => set('target_roles', tags)}
                  placeholder="e.g. Data Engineer, ML Engineer..."
                />
              </div>
              <div className="form-group">
                <label>Preferred Work Type</label>
                <div className="work-type-options">
                  {WORK_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`work-type-btn ${form.work_type === type ? 'selected' : ''}`}
                      onClick={() => set('work_type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Expected Salary Range (USD / year)</label>
                <div className="salary-range">
                  <input
                    type="number"
                    placeholder="Min e.g. 80000"
                    value={form.salary_min}
                    onChange={e => set('salary_min', e.target.value)}
                    min="0"
                  />
                  <span className="salary-dash">–</span>
                  <input
                    type="number"
                    placeholder="Max e.g. 120000"
                    value={form.salary_max}
                    onChange={e => set('salary_max', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="setup-footer">
          {step > 0 && (
            <button type="button" className="btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          <div className="setup-footer-right">
            {step < STEP_TITLES.length - 1 ? (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  style={{ marginRight: '0.5rem' }}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                >
                  Next
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
