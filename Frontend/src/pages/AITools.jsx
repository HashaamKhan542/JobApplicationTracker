import { useState } from 'react'
import { getInterviewPrep, getFitScore } from '../api/client'

function AITools() {
  const [activeTab, setActiveTab] = useState('interview')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [interviewResult, setInterviewResult] = useState(null)
  const [fitResult, setFitResult] = useState(null)

  const handleInterviewPrep = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    try {
      const response = await getInterviewPrep(jobDescription)
      setInterviewResult(response.data.questions)
    } catch (error) {
      console.error('Error getting interview prep:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFitScore = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    try {
      const response = await getFitScore(jobDescription)
      setFitResult(response.data.result)
    } catch (error) {
      console.error('Error getting fit score:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>AI Tools</h2>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'interview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('interview')}
        >
          Interview Prep
        </button>
        <button
          className={activeTab === 'fit' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('fit')}
        >
          Fit Score
        </button>
      </div>

      <div className="ai-container">
        <div className="jd-input">
          <label>Paste Job Description</label>
          <textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
          />
        </div>

        {activeTab === 'interview' && (
          <div className="ai-section">
            <button
              className="btn-primary btn-full"
              onClick={handleInterviewPrep}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Interview Questions'}
            </button>
            {interviewResult && (
              <div className="ai-result">
                <h3>Interview Questions</h3>
                <pre className="result-text">{interviewResult}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fit' && (
          <div className="ai-section">
            <button
              className="btn-primary btn-full"
              onClick={handleFitScore}
              disabled={loading}
            >
              {loading ? 'Analysing...' : 'Analyse My Fit'}
            </button>
            {fitResult && (
              <div className="ai-result">
                <h3>Fit Analysis</h3>
                <pre className="result-text">{fitResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AITools