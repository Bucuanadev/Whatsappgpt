# User Requirements Summary: WhatsApp GPT Platform

## 1. Core Vision
To develop a user-friendly SaaS platform, named "Whatsapp GPT", that enables non-technical users (businesses) to easily set up and manage AI agents on WhatsApp for customer service automation. The platform should abstract away all complexities of APIs, n8n, and programming.

## 2. Key User Experience (UX) Flow for Non-Technical Users
- **Access Interface**: Users access a web-based interface (dashboard).
- **WhatsApp Connection**: Users scan a QR code from their WhatsApp Business account to connect.
- **Company Information Input**: Users provide details about their business (e.g., name, service type, operating hours, payment methods, FAQs, etc.). They can also upload documents (PDFs, images, presentations, website links) to serve as the AI agent's knowledge base.
- **Automated AI Agent Setup**: The system automatically configures and deploys the AI agent based on the provided information.
- **Immediate Operation**: The WhatsApp AI agent begins responding to customer inquiries automatically.

## 3. Automated Backend Processes (Abstracted from User)
- **Evolution API Instance Creation**: The system must automatically create a personalized instance of an n8n flow via the Evolution App API for each new connected business.
- **n8n Flow Integration**: The client's WhatsApp number is connected to a generic n8n flow template (pre-built by the platform developers) that handles AI responses, scheduling, and other automations.
- **Knowledge Base Management**: All company data and uploaded documents are processed and stored in a Vector Store (e.g., Pinecone, Weaviate). Each company will have its own namespace to ensure data isolation.
- **AI Contextualization**: The AI agent (e.g., using OpenAI GPT-4o + LangChain/LlamaIndex) retrieves responses from this vector-based knowledge base, ensuring accurate and business-specific interactions.
- **Google Calendar Integration**: The system should integrate with the company's Google Calendar for automated scheduling and appointment management.

## 4. Technical Components (as per previous discussions and new requirements)
- **Frontend**: React / Next.js / Tailwind UI (with full localization for pt-PT, en, fr)
- **Backend API**: Flask (Python) or Node.js/Express.js (for managing data, processing documents, triggering Evolution App, connecting APIs)
- **Vector Store**: Pinecone, Weaviate, or Qdrant (for AI knowledge base)
- **AI / NLP**: OpenAI GPT-4o, LangChain, LlamaIndex
- **Automation**: n8n + Evolution App API
- **Database**: Redis (for billing, user data, etc.)
- **Storage**: Supabase (for documents, media)
- **Authentication**: Firebase Auth or Clerk
- **Calendar**: Google Calendar API
- **WhatsApp**: WhatsApp Business API

## 5. Billing and Referral System (already discussed and partially implemented)
- Credit-based system (2 credits = 1 message)
- Pricing in MZN and USD (e.g., 20 credits for 130 MZN / $2 USD)
- Local payment methods (M-Pesa, e-Mola, debit/credit card)
- Signup bonus (200 free credits)
- Referral program (50 credits for invitee signup, 5% commission on referred user's credit purchases).

## 6. Project Name
- "Whatsapp GPT" (main application name)
- "whatsapp-saas" (internal project name/folder)

## 7. Next Steps (as per previous plan)
- Create wireframe for the web interface (user onboarding flow).
- Design the database model (structure per company).
- Outline the API structure (routes and database).
- Configure the embeddings pipeline and vector store.
- Create a generic n8n flow model (duplicable template via Evolution App).
- Connect with WhatsApp Business and test real scheduling.

