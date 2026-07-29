"""
attendance_agent.py
-------------------
Responsibility: The AI Agent layer.
  1. Receive raw user question.
  2. Build a structured prompt with live attendance data.
  3. Send to Groq LLM and return the response.

No math, no file I/O — only prompt engineering + LLM call.
"""

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from config import GROQ_API_KEY
from services.attendance_service import AttendanceService


class AttendanceAgent:
    """
    LLM-powered attendance agent using Groq.
    Builds a system prompt from live attendance data and
    passes the user's question to the model.
    """

    def __init__(self) -> None:
        self.service = AttendanceService()
        self.llm = ChatGroq(
            model="openai/gpt-oss-120b",
            api_key=GROQ_API_KEY,
            max_tokens=4096,
        )
        self._system_prompt = self._build_system_prompt()

    def ask(self, question: str) -> str:
        """
        Send the user's question to Groq LLM with attendance context.
        Returns the model's natural language response.
        """
        try:
            messages = [
                SystemMessage(content=self._system_prompt),
                HumanMessage(content=question),
            ]
            response = self.llm.invoke(messages)
            return response.content.strip()
        except Exception as e:
            return f"  [Agent Error] Could not get a response: {e}"

    def _build_system_prompt(self) -> str:
        """
        Construct the system prompt by injecting live attendance data.
        Called once at init — data is static for the session.
        """
        student = self.service.student
        records = self.service.get_all_records()
        overall = self.service.get_overall_attendance()
        eligible, defaulters = self.service.check_eligibility()

        # Build subject data block
        subject_lines = []
        for r in records:
            pct = r.attendance_percentage()
            status = "SHORTAGE" if pct < 75 else ("EXCELLENT" if pct >= 90 else "OK")
            subject_lines.append(
                f"  - {r.subject}: {r.attended_classes}/{r.total_classes} classes "
                f"= {pct:.1f}% [{status}] | Faculty: {r.faculty} | Credits: {r.credits}"
            )

        defaulter_names = ", ".join(r.subject for r in defaulters) if defaulters else "None"

        return f"""You are SmartCampus, an AI Attendance Assistant for a college student.

STUDENT PROFILE:
  Name       : {student.name}
  Roll No    : {student.roll_number}
  Department : {student.department}
  Semester   : {student.semester}

ATTENDANCE DATA:
{chr(10).join(subject_lines)}

SUMMARY:
  Overall Attendance (weighted by credits) : {overall:.1f}%
  Exam Eligibility                         : {"ELIGIBLE" if eligible else "NOT FULLY ELIGIBLE"}
  Subjects with shortage (<75%)            : {defaulter_names}

RULES YOU MUST FOLLOW:
  1. Answer ONLY attendance-related questions using the data above.
  2. If asked about a subject, always show: attended/total, percentage, faculty, status.
  3. If asked about eligibility, list all shortage subjects and classes needed to reach 75%.
  4. For "classes needed to reach 75%", calculate it correctly:
     needed = smallest N where (attended + N) / (total + N) >= 0.75
  5. Keep responses concise, structured, and professional.
  6. Use bullet points or tables where appropriate.
  7. If the question is not attendance-related, politely say you can only help with attendance.
  8. Never make up data — use only the numbers provided above.
"""
