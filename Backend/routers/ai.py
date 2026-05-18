from fastapi import APIRouter
from pydantic import BaseModel
import anthropic

router = APIRouter()

client = anthropic.Anthropic()

CANDIDATE_PROFILE = """
Name: Hashaam Khan
Education:
- Master of Data Science, Deakin University (Distinction, WAM 73)
- Bachelor of Software Engineering (CGPA 3.58, 2nd in batch)

Skills: Python, SQL, LangChain, Hugging Face, LLM fine-tuning (LLaMA-2, QLoRA), 
React, FastAPI, REST APIs, MongoDB, Power BI, Tableau

Projects:
- LLaMA-2 medical misinformation detection system (77% accuracy)
- Mistral-7B mental health chatbot with hallucination detection
- Healthcare analytics dashboard (55,500 records)

Target Roles: AI Engineer, Data Engineer, Data Analyst
"""

class JDRequest(BaseModel):
    job_description: str

@router.post("/interview-prep")
def interview_prep(request: JDRequest):
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system="""You are an expert interview coach. Given a job description, 
        generate 5 to 8 tailored interview questions. Categorise each question 
        as Technical, Behavioural, or Situational. Format your response clearly 
        with the category label before each question.""",
        messages=[
            {
                "role": "user",
                "content": f"Generate interview questions for this job description:\n\n{request.job_description}"
            }
        ]
    )
    return {"questions": message.content[0].text}

@router.post("/fit-score")
def fit_score(request: JDRequest):
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=f"""You are a career advisor. You have access to the following candidate profile:

{CANDIDATE_PROFILE}

Given a job description, analyse how well this candidate fits the role.
Return your response in this exact format:
- Fit Score: (a number from 0 to 100)
- Matched Skills: (list the matching skills)
- Skill Gaps: (list what the candidate is missing)
- Recommendation: (2 to 3 sentences summarising the fit)""",
        messages=[
            {{
                "role": "user",
                "content": f"Analyse my fit for this job:\n\n{{request.job_description}}"
            }}
        ]
    )
    return {{"result": message.content[0].text}}