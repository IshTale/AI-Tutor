"""
Knowledge Base Loader - Populates the KnowledgeBase with curriculum content
from the AI Landscape markdown file.
"""

import json
import hashlib
from typing import List
from .knowledge_base import KnowledgeBase


class KBLoader:
    """Loads curriculum content into the Knowledge Base."""
    
    def __init__(self):
        self.kb = KnowledgeBase()
        self.curriculum_data = {
            "Module 1": {
                "title": "The AI Landscape & Understanding the Risks",
                "description": "Baseline understanding of how AI systems work and where vulnerabilities lie",
                "subtopics": [
                    {
                        "id": "public_vs_enterprise",
                        "title": "Public vs. Enterprise AI",
                        "content": "Understanding the critical differences between consumer-grade tools (e.g., public ChatGPT, Gemini) and enterprise-grade, sandboxed tools (e.g., Microsoft Copilot, Gemini for Workspace).",
                    },
                    {
                        "id": "shadow_ai",
                        "title": "Shadow AI",
                        "content": "The risks of employees using unapproved, unsanctioned AI tools for company work.",
                    },
                    {
                        "id": "how_ai_uses_data",
                        "title": "How AI Uses Data",
                        "content": "Explaining how public models train on user inputs and the concept of data retention.",
                    },
                ],
                "resources": [
                    {
                        "type": "document",
                        "title": "NIST AI Risk Management Framework (AI RMF 1.0)",
                        "url": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
                        "description": "The gold standard for understanding how to frame and manage AI risks.",
                    },
                    {
                        "type": "website",
                        "title": "MITRE ATLAS",
                        "url": "https://atlas.mitre.org/",
                        "description": "A knowledge base of adversary tactics and techniques against AI systems.",
                    },
                ],
            },
            "Module 2": {
                "title": "Data Privacy and Confidentiality",
                "description": "What can and cannot be fed into an AI prompt - most critical for day-to-day employees",
                "subtopics": [
                    {
                        "id": "protect_ip",
                        "title": "Protecting Intellectual Property (IP)",
                        "content": "Why proprietary code, internal strategy documents, and financial data must never enter public LLMs.",
                    },
                    {
                        "id": "handling_pii",
                        "title": "Handling PII and Sensitive Data",
                        "content": "Strict rules against inputting Personally Identifiable Information (customer data, employee records) to avoid GDPR, CCPA, or HIPAA violations.",
                    },
                    {
                        "id": "data_minimization",
                        "title": "Data Minimization",
                        "content": "Training employees to abstract or anonymize data before using AI for analysis (e.g., replacing client names with 'Client A').",
                    },
                ],
                "resources": [
                    {
                        "type": "website",
                        "title": "Microsoft: Safety tips for using AI at work",
                        "url": "https://support.microsoft.com/en-us/security/safety-tips-for-using-ai-at-work",
                        "description": "Excellent, digestible guidelines for everyday employees.",
                    },
                    {
                        "type": "document",
                        "title": "Guidelines for secure AI system development (CISA/NCSC)",
                        "url": "https://www.cisa.gov/resources-tools/resources/guidelines-secure-ai-system-development",
                        "description": "Focuses on the broader security infrastructure.",
                    },
                ],
            },
            "Module 3": {
                "title": "Secure and Responsible Prompting",
                "description": "How to interact with AI safely while avoiding manipulation and over-reliance",
                "subtopics": [
                    {
                        "id": "human_in_loop",
                        "title": "Human-in-the-Loop Mandate",
                        "content": "Treating AI outputs as first drafts or 'inputs,' not final, unverified answers.",
                    },
                    {
                        "id": "prompt_injection",
                        "title": "Prompt Injection & Jailbreaking",
                        "content": "A high-level overview of how malicious actors manipulate AI inputs, and why employees shouldn't blindly trust or execute AI-generated links or code.",
                    },
                    {
                        "id": "ai_phishing",
                        "title": "AI-Enabled Phishing & Deepfakes",
                        "content": "Recognizing how AI has escalated social engineering attacks (e.g., hyper-realistic voice cloning of executives or highly targeted phishing emails).",
                    },
                ],
                "resources": [
                    {
                        "type": "website",
                        "title": "OWASP Top 10 for LLM Applications",
                        "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
                        "description": "A highly authoritative list of the top security flaws in AI usage, specifically highlighting prompt injection and data poisoning.",
                    },
                    {
                        "type": "website",
                        "title": "Google Secure AI Framework (SAIF)",
                        "url": "https://safety.google/cybersecurity-advancements/saif/",
                        "description": "Google's conceptual framework for securing AI technology.",
                    },
                ],
            },
            "Module 4": {
                "title": "Ethics, Accuracy, and Bias",
                "description": "AI is not infallible - professionals need to critically evaluate AI outputs",
                "subtopics": [
                    {
                        "id": "hallucinations",
                        "title": "Hallucinations",
                        "content": "Why AI makes up facts, statistics, and legal precedents, and the importance of verifying claims with primary sources.",
                    },
                    {
                        "id": "algorithmic_bias",
                        "title": "Algorithmic Bias",
                        "content": "How training data can lead to discriminatory outputs, especially in sensitive HR, hiring, or performance review contexts.",
                    },
                    {
                        "id": "copyright",
                        "title": "Copyright and Plagiarism",
                        "content": "Understanding the legal grey areas of using AI-generated images, text, and code in commercial products.",
                    },
                ],
                "resources": [
                    {
                        "type": "website",
                        "title": "The EU AI Act",
                        "url": "https://artificialintelligenceact.eu/",
                        "description": "Essential reading for understanding global compliance, transparency, and accountability expectations.",
                    },
                    {
                        "type": "website",
                        "title": "World Economic Forum: Presidio AI Framework",
                        "url": "https://www.weforum.org/publications/presidio-ai-framework-towards-safe-generative-ai-models/",
                        "description": "Guidelines on safe generative AI deployment and ethical considerations.",
                    },
                ],
            },
            "Module 5": {
                "title": "Organizational Governance and Compliance",
                "description": "How employees align with specific corporate AI policies",
                "subtopics": [
                    {
                        "id": "aup",
                        "title": "Acceptable Use Policy (AUP)",
                        "content": "Defining exactly which tools are approved, conditionally approved, or banned.",
                    },
                    {
                        "id": "incident_reporting",
                        "title": "Incident Reporting",
                        "content": "What to do if an employee accidentally pastes sensitive data into a public AI tool.",
                    },
                    {
                        "id": "continuous_literacy",
                        "title": "Continuous Literacy",
                        "content": "Encouraging a culture of open discussion regarding new AI tools, limitations, and evolving risks.",
                    },
                ],
                "resources": [
                    {
                        "type": "website",
                        "title": "ISACA AI Resources",
                        "url": "https://www.isaca.org/resources/artificial-intelligence",
                        "description": "Great frameworks for IT governance, auditing, and continuous compliance.",
                    },
                    {
                        "type": "document",
                        "title": "OWASP AI Security and Privacy Guide",
                        "url": "https://owasp.org/www-project-ai-security-and-privacy-guide/",
                        "description": "Comprehensive guidance on establishing organizational responsibility and risk treatment.",
                    },
                ],
            },
        }

    def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate a simple embedding based on text hash.
        In production, use a real embedding model (e.g., OpenAI, Gemini).
        """
        hash_value = hashlib.md5(text.encode()).hexdigest()
        return [float(int(hash_value[i:i+2], 16)) / 255.0 for i in range(0, 32, 2)]

    def load_curriculum(self) -> KnowledgeBase:
        """Load all curriculum modules into the knowledge base."""
        
        for module_key, module_data in self.curriculum_data.items():
            # Index module-level asset
            module_uri = f"module:{module_key.lower().replace(' ', '_')}"
            module_embedding = self._generate_embedding(module_data["title"] + module_data["description"])
            
            self.kb.index_asset(
                asset_uri=module_uri,
                embedding=module_embedding,
                metadata={
                    "type": "module",
                    "module_id": module_key,
                    "title": module_data["title"],
                    "description": module_data["description"],
                    "topic_id": module_key.lower().replace(" ", "_"),
                }
            )
            
            # Index subtopics
            for subtopic in module_data.get("subtopics", []):
                subtopic_uri = f"subtopic:{module_key.lower().replace(' ', '_')}:{subtopic['id']}"
                subtopic_embedding = self._generate_embedding(subtopic["title"] + subtopic["content"])
                
                self.kb.index_asset(
                    asset_uri=subtopic_uri,
                    embedding=subtopic_embedding,
                    metadata={
                        "type": "subtopic",
                        "module_id": module_key,
                        "subtopic_id": subtopic["id"],
                        "title": subtopic["title"],
                        "content": subtopic["content"],
                        "topic_id": module_key.lower().replace(" ", "_"),
                    }
                )
            
            # Index resources
            for idx, resource in enumerate(module_data.get("resources", [])):
                resource_uri = f"resource:{module_key.lower().replace(' ', '_')}:{idx}"
                resource_embedding = self._generate_embedding(resource["title"] + resource["description"])
                
                self.kb.index_asset(
                    asset_uri=resource_uri,
                    embedding=resource_embedding,
                    metadata={
                        "type": "resource",
                        "module_id": module_key,
                        "resource_type": resource["type"],
                        "title": resource["title"],
                        "url": resource["url"],
                        "description": resource["description"],
                        "topic_id": module_key.lower().replace(" ", "_"),
                    }
                )
        
        return self.kb

    def get_modules(self) -> List[dict]:
        """Get all modules from the curriculum."""
        return [
            {
                "id": key,
                "title": data["title"],
                "description": data["description"],
                "subtopic_count": len(data.get("subtopics", [])),
                "resource_count": len(data.get("resources", [])),
            }
            for key, data in self.curriculum_data.items()
        ]


# Initialize and export a global knowledge base instance
def init_knowledge_base() -> KnowledgeBase:
    """Initialize the knowledge base with curriculum content."""
    loader = KBLoader()
    return loader.load_curriculum()
