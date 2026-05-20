import { useState } from 'react'
import { getInterviewPrep, getFitScore } from '../api/client'

// Parse fit score response into structured data
function parseFitScore(text) {
  // Handle score wrapped in bold markers e.g. **75** or plain 75
  const scoreMatch = text.match(/Fit Score:\s*\*{0,2}(\d+)\*{0,2}/i)
    || text.match(/Score:\s*\*{0,2}(\d+)\*{0,2}/i)

  // Capture multi-line content until the next section header
  const matchedMatch = text.match(/Matched Skills?:\s*([\s\S]*?)(?=\n\s*[-•*]?\s*Skill Gaps?:|\n\s*Skill Gaps?:|$)/i)
  const gapsMatch = text.match(/Skill Gaps?:\s*([\s\S]*?)(?=\n\s*[-•*]?\s*Recommendation:|\n\s*Recommendation:|$)/i)
  const recMatch = text.match(/Recommendation:\s*([\s\S]+?)$/i)

  const parseList = (str) => {
    if (!str || !str.trim()) return []
    const lines = str.split('\n')
      .map(s => s.replace(/^\s*[-*•]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(s => s && !/^[-*•]+$/.test(s))  // remove empty and lone bullet chars

    if (lines.length > 1) return lines

    // Single line — split by comma but not inside parentheses
    return (lines[0] || '').split(/,(?![^(]*\))/)
      .map(s => s.replace(/^\s*[-*•]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(s => s && !/^[-*•]+$/.test(s))
  }

  // Strip leading stray asterisks from recommendation
  const rawRec = (recMatch?.[1] || '').trim().replace(/^\*+\s*/, '')

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : null,
    matched: parseList(matchedMatch?.[1] || ''),
    gaps: parseList(gapsMatch?.[1] || ''),
    recommendation: rawRec,
  }
}

// Render inline bold (**text**) as <strong> elements
function renderBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.replace(/\*\*/g, '')  // strip any remaining unpaired **
  )
}

// Parse interview questions into categorised sections
function parseQuestions(text) {
  const sections = []
  const lines = text.split('\n')
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^#{1,3}\s/.test(trimmed)) {
      const title = trimmed.replace(/^#{1,3}\s*\*{0,2}/, '').replace(/\*{0,2}$/, '').trim()
      if (title && !title.toLowerCase().includes('interview questions for')) {
        current = { category: title, questions: [] }
        sections.push(current)
      }
      continue
    }

    const qMatch = trimmed.match(/^\*{0,2}(\d+)\.\s+(.+)$/)
    if (qMatch && current) {
      // Strip any **Category:** prefix Claude might add (e.g. "**Technical:** question")
      const q = qMatch[2]
        .replace(/^\*{0,2}[A-Za-z]+:\*{0,2}\s*/,'')
        .replace(/\*\*/g, '')
        .trim()
      if (q) current.questions.push(q)
      continue
    }

    if (trimmed.startsWith('**') && current) {
      const clean = trimmed.replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').trim()
      if (clean) current.questions.push(clean)
    }
  }

  return sections.filter(s => s.questions.length > 0)
}

const CATEGORY_COLORS = {
  technical: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  behavioural: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  behavioral: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  situational: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
}

function categoryStyle(name) {
  const key = name.toLowerCase().split(/\s+/)[0]
  return CATEGORY_COLORS[key] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
}

function scoreColor(score) {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function FitScoreResult({ data }) {
  const { score, matched, gaps, recommendation } = data
  const color = scoreColor(score ?? 0)
  const pct = score ?? 0

  return (
    <div className="fit-result">
      {/* Score Ring */}
      <div className="fit-score-row">
        <div className="score-ring-wrap">
          <div
            className="score-ring"
            style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 0deg)` }}
          >
            <div className="score-ring-inner">
              <span className="score-number">{score ?? '–'}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
          <p className="score-caption" style={{ color }}>
            {pct >= 75 ? 'Strong Match' : pct >= 50 ? 'Moderate Match' : 'Weak Match'}
          </p>
        </div>

        {recommendation && (
          <div className="fit-recommendation">
            <p className="fit-rec-title">Recommendation</p>
            <p className="fit-rec-text">{renderBold(recommendation)}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="fit-skills-grid">
        {matched.length > 0 && (
          <div className="fit-skill-section">
            <p className="fit-skill-heading matched-heading">✓ Matched Skills</p>
            <div className="fit-tags">
              {matched.map(s => (
                <span key={s} className="fit-tag fit-tag-matched">{s}</span>
              ))}
            </div>
          </div>
        )}
        {gaps.length > 0 && (
          <div className="fit-skill-section">
            <p className="fit-skill-heading gaps-heading">✗ Skill Gaps</p>
            <div className="fit-tags">
              {gaps.map(s => (
                <span key={s} className="fit-tag fit-tag-gap">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InterviewResult({ text }) {
  const sections = parseQuestions(text)
  if (!sections.length) {
    return <pre className="result-text">{text}</pre>
  }

  return (
    <div className="interview-result">
      {sections.map((section, si) => {
        const style = categoryStyle(section.category)
        return (
          <div key={si} className="interview-section">
            <div className="interview-section-header">
              <span
                className="interview-category-badge"
                style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
              >
                {section.category}
              </span>
              <span className="interview-count">{section.questions.length} questions</span>
            </div>
            <div className="interview-questions">
              {section.questions.map((q, qi) => (
                <div key={qi} className="interview-question-card">
                  <span
                    className="q-number"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {qi + 1}
                  </span>
                  <p className="q-text">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AITools() {
  const [activeTab, setActiveTab] = useState('interview')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [interviewResult, setInterviewResult] = useState(null)
  const [fitResult, setFitResult] = useState(null)

  const handleInterviewPrep = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    setInterviewResult(null)
    try {
      const res = await getInterviewPrep(jobDescription)
      setInterviewResult(res.data.questions)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFitScore = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    setFitResult(null)
    try {
      const res = await getFitScore(jobDescription)
      setFitResult(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>AI Tools</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Powered by Claude — tailored to your profile
          </p>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'interview' ? 'tab active' : 'tab'} onClick={() => setActiveTab('interview')}>
          🎤 Interview Prep
        </button>
        <button className={activeTab === 'fit' ? 'tab active' : 'tab'} onClick={() => setActiveTab('fit')}>
          📊 Fit Score
        </button>
      </div>

      <div className="ai-container">
        <div className="jd-input">
          <label>Paste Job Description</label>
          <textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            rows={9}
          />
        </div>

        {activeTab === 'interview' && (
          <div className="ai-section">
            <button className="btn-primary btn-full" onClick={handleInterviewPrep} disabled={loading || !jobDescription.trim()}>
              {loading ? '✨ Generating questions...' : 'Generate Interview Questions'}
            </button>

            {loading && (
              <div className="ai-loading-card">
                <div className="ai-spinner" />
                <p>Analysing job description and generating tailored questions...</p>
              </div>
            )}

            {interviewResult && !loading && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>Interview Questions</h3>
                  <button className="btn-copy" onClick={() => navigator.clipboard.writeText(interviewResult)}>
                    Copy all
                  </button>
                </div>
                <InterviewResult text={interviewResult} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'fit' && (
          <div className="ai-section">
            <button className="btn-primary btn-full" onClick={handleFitScore} disabled={loading || !jobDescription.trim()}>
              {loading ? '✨ Analysing fit...' : 'Analyse My Fit'}
            </button>

            {loading && (
              <div className="ai-loading-card">
                <div className="ai-spinner" />
                <p>Comparing your profile against the job requirements...</p>
              </div>
            )}

            {fitResult && !loading && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>Fit Analysis</h3>
                </div>
                <FitScoreResult data={fitResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AITools
