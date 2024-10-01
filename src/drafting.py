from langchain_community.document_loaders import PyPDFLoader
import pandas as pd
from .config import Config
from dotenv import load_dotenv
import os
import json

from llama_index.agent.openai import OpenAIAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from llama_index.tools.duckduckgo import DuckDuckGoSearchToolSpec


load_dotenv()

class Drafting(Config):


    def __init__(self):
        
        super().__init__()
        self.api_key = os.environ.get('openai')
        self.client = OpenAI(api_key=self.api_key)
        self.template_register = pd.read_csv(self.PRODUCTION_DRAFT_TEMPLATE_PATH)
        self.drafting_categories = self.template_register['drafting_category'].unique().tolist()
        self.lawsuit_types = self.template_register[self.template_register['drafting_category']=='lawsuit']['drafting_type'].unique().tolist()
        self.contract_types = self.template_register[self.template_register['drafting_category']=='contract']['drafting_type'].unique().tolist()
    
    def create_draft(self, user_input, user_country, template_content , sub_type,drafting_type): 

        template_content = """Partnership Agreement
1. Introduction (Purpose of the Agreement, Partnership Name, Principal Office)
2. Definitions (Terms and Definitions, Interpretations)
3. Formation of Partnership (Effective Date, Partnership Term, Nature of Business)
4. Capital Contributions (Initial Capital Contributions, Additional Capital Contributions, Valuation of
Non-Cash Contributions)
5. Ownership Interests (Percentage Interests, Changes in Ownership Interests)
6. Management and Duties (Management Structure, Duties of Partners, Decision Making and Voting, Management Fees, Employment of Family Members)
7. Meetings of Partners (Regular Meetings, Special Meetings, Notice of Meetings, Quorum and
Voting, Meeting Minutes)
8. Distributions (Distribution of Profits, Distribution of Losses, Withholding of Distributions)
9. Accounting and Records (Fiscal Year, Books and Records, Financial Statements, Banking, Audits
and Inspections)
10. Tax Matters (Tax Elections, Tax Returns, Tax Audits and Litigation, Tax Matters Partner)
11. Transfers of Partnership Interests (General Restrictions, Right of First Refusal, Buy-Sell
Agreement, Transfer upon Death or Disability)
12. Withdrawal and Dissolution (Voluntary Withdrawal, Involuntary Withdrawal, Dissolution Events, Liquidation and Distribution of Assets)
13. Confidentiality and Non-Compete (Confidentiality Obligations, Non-Compete Clause, Non- Solicitation)
14. Dispute Resolution (Mediation, Arbitration, Governing Law)
15. Miscellaneous Provisions (Amendments, Entire Agreement, Severability, Waiver, Notices, Counterparts, Headings)
16. Signatures (Partner Signatures, Witness Signatures)
17. Appendices (Initial Capital Contributions, Schedule of Partner Contributions, Buy-Sell Agreement
Template, Non-Disclosure Agreement, Partner Duties and Responsibilities)"""
        prompt_template = ( f"<System Prompt> You are an expert {user_country} base lawyer specializing in meticulous drafting of legal documents. Your task is to prepare a lengthy draft based on the specific requirements provided in the query.\n\n"
        "Instruction you must follow while writing draft:-\n"
        "1. Thoroughly elaborate on each section of the template with comprehensive descriptions.\n"
        "2. Utilize appropriate legal terminology to enhance clarity and precision.\n"
        "3. Expand each section significantly by incorporating additional points, nuances, and clauses.\n"
        "4. Please revise the document by merging the points into a single cohesive paragraph. Instead of using subsections, incorporate all the details into a comprehensive and unified section. Ensure the paragraph flows smoothly and logically, covering all necessary points in a coherent manner.\n"
        "5. Enhance the depth and completeness of the document through detailed elaboration, ensuring it contains at least 2500 words.\n"
        "6. Include references to relevant laws, precedents, and legal principles.\n"
        "7. Substantiate the draft with citations and legal references to support key points.\n"
        "8. Introduce relevant sections that may enhance the document, even if not explicitly outlined in the template.\n"
        "9. Repeat some statements multiple times using paraphrasing in order to increase the content of sections.\n"
        "10. Provide clarity of statements by writing the following statement in simple language.\n"
        "11. Detect user language and prepare draft in the same language that user use in input. Do not include subpoints in section heading.\n"
        "12. If user asks to generate a draft in any specific language then use the requested language in draft.\n"
        "13. Use {user_country} currency in draft.\n"
        "14. Do not generate any extra information other than draft\n"
        f"Template:-{template_content}\n\n"
        "<User Input>"
        f"query :- {user_input}")

        llm_openai = OpenAI(temperature=self.DRAFTING_STUDENT_TEMPERATURE, model=self.DRAFTING_STUDENT_MODEL_NAME) 
        agent = OpenAIAgent.from_tools(llm=llm_openai, verbose="True")

        answer = agent.stream_chat(prompt_template)
        for chunk in answer.response_gen:    
            chunk = chunk.replace("\n", "<br>").replace("**", "<b>").replace("**:", "</b>:")
            yield str(chunk)