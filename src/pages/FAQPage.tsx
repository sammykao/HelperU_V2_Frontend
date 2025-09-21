import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface FAQItem {
  question: string;
  answer: string;
  tags: string[];
}

interface FAQCategory {
  [key: string]: FAQItem;
}

interface FAQData {
  [category: string]: FAQCategory;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // FAQ data from faq_tools.py
  const faqData: FAQData = {
    "general": {
      "what_is_helperu": {
        "question": "What is HelperU?",
        "answer": `HelperU is a platform that connects people who need help with tasks to qualified student helpers in their area. Whether you need help moving, cleaning, handyman work, tutoring, or any other task, we connect you with reliable student helpers who can get the job done.

Our platform serves two main groups:
- Clients: People who need help with various tasks and projects
- Student Helpers: College students looking to earn money by helping others with tasks

We focus on creating a safe, reliable, and efficient marketplace where quality work meets fair compensation.`,
        "tags": ["platform", "overview", "introduction"]
      },
      "how_it_works": {
        "question": "How does HelperU work?",
        "answer": `HelperU works as a simple three-step process:

For Clients:
1. Post a Task: Create a detailed task description with location, budget, and requirements
2. Get Applications: Receive applications from qualified student helpers in your area
3. Chat & Hire: Chat with helpers, hire and pay them seperately, and mark complete the task when the work is done so it is not searchable or available for new applications.

For Student Helpers:
1. Sign Up & Verify: Create your profile and complete identity verification
2. Browse Tasks: Search for available tasks that match your skills and location
3. Apply & Earn: Apply for tasks, complete the work, and get paid by the client.

Key Features:
- Location-based matching
- Identity verification for helpers
- Real-time messaging`,
        "tags": ["process", "workflow", "steps"]
      },
      "safety_security": {
        "question": "Is HelperU safe and secure?",
        "answer": `Yes, HelperU prioritizes safety and security for all users:

For Clients:
- All helpers undergo email and phone verification for safety and college verification for accuracy.
- Hands on dispute resolution process, with a lenient approach to resolving issues as well as refunds.

For Helpers:
- Clear task descriptions and requirements
- Support for payment disputes
- Hands on dispute resolution process, with a lenient approach to resolving issues as well as unpaid tasks.

Platform Security:
- Encrypted data transmission
- Secure user authentication
- Privacy protection for personal information
- 24/7 customer support

Trust Features:
- Rating and review system
- Profile verification badges
- Task completion tracking
- Secure messaging system`,
        "tags": ["safety", "security", "trust", "verification"]
      }
    },
    "pricing": {
      "task_posting_cost": {
        "question": "How much does it cost to post a task?",
        "answer": `HelperU offers flexible pricing plans for task posting:

Free Plan:
- 1 task postings per month
- Standard support

Premium Plan ($9.99/month):
- Unlimited task postings
- Priority customer support
- Task pro

Payment Methods:
- Credit/Debit cards
- PayPal
- Apple Pay
- Google Pay`,
        "tags": ["pricing", "cost", "subscription", "fees"]
      },
      "helper_earnings": {
        "question": "How much can helpers earn on HelperU?",
        "answer": `Helper earnings on HelperU vary based on several factors:

Average Earnings:
- Part-time helpers: $50-$300/month
- Full-time helpers: $300-$800/month
- Top performers: $800-$1500/month

Task Rate Examples:
- Moving help: $25-$50/hour
- Cleaning: $20-$35/hour
- Tutoring: $30-$60/hour
- Handyman work: $30-$75/hour
- Pet sitting: $15-$30/hour

- Transparent fee structure`,
        "tags": ["earnings", "money", "payment", "rates"]
      }
    },
    "registration": {
      "signup_process": {
        "question": "How do I sign up for HelperU?",
        "answer": `Signing up for HelperU is quick and easy:

For Clients:
1. Visit helperu.com and click "Sign Up"
3. Enter your phone number
4. Enter your phone to login and complete verification
5. Complete your profile with basic information
6. Start posting tasks immediately

For Student Helpers:
1. Visit helperu.com and click "Sign Up"
2. Enter your email and phone number
4. Verify your email and phone
5. Complete your profile with:
   - Personal information
   - College
   - Bio
   - Profile photo
7. Start browsing and applying for tasks

Required Information:
- Valid email address
- Phone number
- Full name
- Date of birth (for helpers)
- Location information

Verification Process:
- Email verification (instant)
- Phone verification (SMS code)
- Background check (optional, premium feature)`,
        "tags": ["signup", "registration", "account", "verification"]
      },
      "profile_completion": {
        "question": "How do I complete my profile?",
        "answer": `Completing your HelperU profile is important for better matching:

Client Profile Requirements:
- Profile photo
- Contact information
- Preferred communication method
- Location and service area
- Task history (optional)

Helper Profile Requirements:
- Profile photo (required)
- Personal information
- Skills and experience
- Education background
- Availability schedule
- Hourly rates
- References (optional)
- Portfolio/work samples (optional)

Profile Completion Tips:
- Use a clear, professional photo
- Be specific about your skills
- Set realistic availability
- Include relevant experience
- Add a compelling bio
- Keep information up to date

Profile Verification:
- Identity verification (required for helpers)
- Skills assessment (optional)
- Reference checks (optional)
- Background check (premium feature)

Profile Benefits:
- Higher visibility in search results
- Better matching with tasks/clients
- Increased trust and credibility
- Higher earning potential
- Priority customer support`,
        "tags": ["profile", "completion", "verification", "setup"]
      }
    },
    "tasks": {
      "task_types": {
        "question": "What types of tasks can I post or find on HelperU?",
        "answer": `HelperU supports a wide variety of tasks across multiple categories:

Moving & Transportation:
- Apartment/house moving
- Furniture assembly
- Delivery services
- Vehicle assistance
- Storage organization

Cleaning & Maintenance:
- House cleaning
- Deep cleaning
- Organizing services
- Laundry assistance
- Pet cleaning

Academic & Tutoring:
- Subject tutoring
- Homework help
- Essay writing assistance
- Test preparation
- Research assistance

Handyman & Repairs:
- Basic repairs
- Assembly services
- Installation help
- Maintenance tasks
- Small construction

Pet & Animal Care:
- Pet sitting
- Dog walking
- Pet grooming assistance
- Farm animal care
- Veterinary assistance

Technology & IT:
- Computer help
- Software assistance
- Website development
- Data entry
- Technical support

Creative & Design:
- Graphic design
- Photography
- Video editing
- Social media management
- Content creation

Other Services:
- Event planning
- Personal shopping
- Errand running
- Child care
- Elder care

Task Requirements:
- Must be legal and ethical
- Cannot involve dangerous activities
- Must be appropriate for student helpers
- Clear scope and requirements
- Fair compensation`,
        "tags": ["tasks", "services", "categories", "types"]
      },
      "task_posting": {
        "question": "How do I post a task on HelperU?",
        "answer": `Posting a task on HelperU is straightforward:

Step-by-Step Process:
1. Log in to your HelperU account
2. Click "Post a Task" button
3. Select category (moving, cleaning, tutoring, etc.)
4. Write description with details about:
   - What needs to be done
   - Specific requirements
   - Location and timing
   - Budget range
5. Set your budget (hourly rate or fixed price)
6. Choose location and service area
7. Add photos (optional but recommended)
8. Set deadline for applications
9. Review and post

Task Description Tips:
- Be specific about requirements
- Include all necessary details
- Mention any special skills needed
- Specify timing and availability
- Include photos if relevant
- Set realistic budget expectations

Budget Guidelines:
- Research similar tasks in your area
- Consider task complexity
- Factor in helper experience level
- Be competitive but fair
- Include materials costs if applicable

Posting Best Practices:
- Respond quickly to applications
- Be clear about expectations
- Provide detailed instructions
- Set realistic deadlines
- Include contact information
- Be available for questions

Task Management:
- Review all applications
- Ask questions before hiring
- Communicate clearly with helper
- Provide feedback after completion
- Rate and review helper`,
        "tags": ["posting", "task", "process", "guidelines"]
      }
    },
    "payments": {
      "payment_methods": {
        "question": "What payment methods does HelperU accept?",
        "answer": `HelperU offers multiple secure payment options:

For Clients (Paying Helpers):
- All seperate: You must pay the helper seperately for the work they do. 
- Rules: If you do not pay the helper, you will be banned from the platform.

For Helpers (Receiving Payments):
- All seperate: You must pay the helper seperately for the work they do. 
- Rules: If you do not pay the helper, you will be banned from the platform.`,
        "tags": ["payment", "money", "fees", "security"]
      },
      "refund_policy": {
        "question": "What is HelperU's refund policy?",
        "answer": `HelperU has a fair and transparent refund policy:

Refund Process:
1. Report issue within 48 hours of task completion
2. Provide evidence (photos, messages, etc.)
3. Platform review (1-3 business days)
4. Refund decision and processing
5. Funds returned to original payment method

Refund Timeline:
- Credit card refunds: 5-10 business days
- PayPal refunds: 1-3 business days
- Bank transfer refunds: 3-5 business days

Customer Protection:
- HelperU Guarantee for quality work
- Insurance coverage for certain tasks
- 24/7 support for payment issues
- Transparent dispute process`,
        "tags": ["refund", "policy", "dispute", "protection"]
      }
    },
    "support": {
      "contact_support": {
        "question": "How do I contact HelperU support?",
        "answer": `HelperU provides multiple ways to get support:

24/7 Customer Support:
- Live Chat: Available on website and mobile app
- Email: info@helperu.com

Support Hours:
- General Support: 24/7
- Phone Support: 8 AM - 8 PM EST
- Priority Support: Available for premium users
- Emergency Support: Available for urgent issues

Support Categories:
- Account Issues: Login, verification, profile
- Task Problems: Posting, matching, completion
- Payment Issues: Billing, refunds, disputes
- Technical Support: App issues, website problems
- Safety Concerns: Trust and safety issues

Response Times:
- Live Chat: Immediate response
- Email: Within 4 hours
- Phone: Immediate during business hours
- Help Center: Self-service available 24/7

Premium Support:
- Priority Support: Faster response times
- Dedicated Support: Assigned support representative
- Extended Hours: Extended phone support
- Custom Solutions: Tailored assistance

Self-Service Options:
- Help Center: Comprehensive FAQ and guides
- Video Tutorials: Step-by-step instructions
- Community Forum: User discussions and tips
- Knowledge Base: Detailed documentation

Emergency Contacts:
- Safety Issues: safety@helperu.com
- Legal Matters: legal@helperu.com
- Press Inquiries: press@helperu.com`,
        "tags": ["support", "contact", "help", "customer_service"]
      },
      "troubleshooting": {
        "question": "What should I do if I have a problem?",
        "answer": `Here's how to resolve common issues on HelperU:

Common Issues and Solutions:

Account Problems:
- Can't log in: Reset password or contact support
- Verification issues: Check email/phone or re-verify
- Profile not updating: Clear cache or try different browser
- Account suspended: Contact support for review

Task Issues:
- No helpers applying: Check budget, description, and location
- Helper no-show: Report immediately and request refund
- Poor quality work: Document issues and contact support
- Task cancellation: Review cancellation policy

Payment Problems:
- Payment declined: Check card details or try different method
- Missing payment: Check payment history or contact support
- Refund not received: Allow 5-10 business days then contact support
- Wrong amount charged: Contact support with transaction details

Technical Issues:
- App not working: Update app or try website version
- Website errors: Clear cache or try different browser
- Messages not sending: Check internet connection
- Photos not uploading: Check file size and format

Safety Concerns:
- Inappropriate behavior: Report immediately to safety@helperu.com
- Safety concerns: Contact support or emergency services
- Fraud attempts: Report to support with evidence
- Trust issues: Use platform messaging and payment

Escalation Process:
1. Try self-service options first
2. Contact support with clear description
3. Provide evidence (screenshots, messages, etc.)
4. Follow up if no response within expected time
5. Escalate to supervisor if needed

Prevention Tips:
- Read policies and terms of service
- Communicate clearly with helpers/clients
- Document everything (messages, photos, payments)
- Use platform features (messaging, payments, reviews)
- Report issues promptly`,
        "tags": ["troubleshooting", "problems", "solutions", "help"]
      }
    }
  };

  const toggleExpanded = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = Object.entries(faqData).reduce((acc, [category, items]) => {
    const filteredItems = Object.entries(items).filter(([key, item]) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
    
    if (filteredItems.length > 0) {
      acc[category] = Object.fromEntries(filteredItems);
    }
    
    return acc;
  }, {} as FAQData);

  const categoryTitles: { [key: string]: string } = {
    general: "General",
    pricing: "Pricing & Payments",
    registration: "Registration & Profiles",
    tasks: "Tasks & Services",
    payments: "Payment Methods",
    support: "Support & Help"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-blue animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about HelperU
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-lg"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {Object.entries(filteredFAQs).map(([category, items]) => (
              <div key={category} className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 font-display">
                  {categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                <div className="space-y-4">
                  {Object.entries(items).map(([key, item]) => {
                    const itemKey = `${category}-${key}`;
                    const isExpanded = expandedItems.has(itemKey);
                    
                    return (
                      <div key={itemKey} className="border border-white/10 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleExpanded(itemKey)}
                          className="w-full px-6 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors duration-200 flex items-center justify-between"
                        >
                          <span className="text-white font-medium pr-4">{item.question}</span>
                          <svg
                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {Object.keys(filteredFAQs).length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No FAQs found for "{searchTerm}"</div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Contact Support CTA */}
          <div className="mt-16 text-center">
            <div className="backdrop-blur-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-300/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4 font-display">
                Still have questions?
              </h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
