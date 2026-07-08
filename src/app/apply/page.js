'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signOut } from 'next-auth/react';

const QUESTIONS = [
  {
    id: 'email',
    question: 'Registered Email Address',
    description: 'This is the email address of the account submitting the application.',
    placeholder: 'your@email.com',
    type: 'email',
    required: true,
  },
  {
    id: 'organizationName',
    question: 'Organization Name',
    description: 'The official name of the company, enterprise, or startup developing the product.',
    placeholder: 'e.g. Shield Cyber Technologies Pvt Ltd',
    type: 'text',
    required: true,
  },
  {
    id: 'contactPersonName',
    question: 'Contact Person Name',
    description: 'Full name of the designated primary contact person.',
    placeholder: 'e.g. Vikramaditya Singh',
    type: 'text',
    required: true,
  },
  {
    id: 'contactEmail',
    question: 'Contact Email Address',
    description: 'The email address for primary communication regarding this product evaluation.',
    placeholder: 'e.g. contact@shieldcyber.in',
    type: 'email',
    required: true,
  },
  {
    id: 'productName',
    question: 'Product / Tool Name',
    description: 'The official brand name of the cybersecurity solution or tool.',
    placeholder: 'e.g. SentinelX NDR',
    type: 'text',
    required: true,
  },
  {
    id: 'productCategory',
    question: 'Product Category',
    description: 'Select the category that best matches your product\'s primary function.',
    type: 'select',
    options: [
      'Endpoint Security',
      'Firewall & UTM',
      'SIEM & SOC',
      'Encryption & PKI',
      'Cloud Security',
      'Email Security',
      'Network Security',
      'AI/ML Security',
      'Mobile Security',
      'IAM & Access Control',
      'Threat Intelligence',
      'Vulnerability Assessment',
      'GRC & Compliance',
      'OT/ICS Security',
      'Blockchain Security',
      'Data Protection & DLP',
    ],
    required: true,
  },
  {
    id: 'deploymentModel',
    question: 'Deployment Model',
    description: 'Select the deployment options supported by your cybersecurity product.',
    type: 'select',
    options: ['On-Premises', 'Cloud', 'Hybrid', 'SaaS'],
    required: true,
  },
  {
    id: 'briefDescription',
    question: 'Brief Description of the Product',
    description: 'Provide a concise overview of the product (Maximum 200 words).',
    placeholder: 'Provide a summary of functionality, security problem solved, and target audience...',
    type: 'textarea',
    wordLimit: 200,
    required: true,
  },
  {
    id: 'keyFeatures',
    question: 'Key Features and Capabilities',
    description: 'Highlight the technical capabilities, unique value propositions, and modules.',
    placeholder: 'Describe key modules, performance highlights, standard detections, etc...',
    type: 'textarea',
    required: true,
  },
  {
    id: 'indigenousContent',
    question: 'Percentage of Indigenous Content (%)',
    description: 'Specify the percentage of research, design, coding, and assembly done locally in India.',
    placeholder: 'e.g. 85',
    type: 'number',
    min: 0,
    max: 100,
    required: true,
  },
  {
    id: 'ipOwnership',
    question: 'Details of Intellectual Property Ownership',
    description: 'Information regarding copyrights, source code ownership, design rights, or patents.',
    placeholder: 'e.g. Fully owned and controlled by Indian parent entity. Patents filed with India IP Office...',
    type: 'textarea',
    required: true,
  },
  {
    id: 'foreignComponents',
    question: 'Details of Foreign-Origin Components (if any)',
    description: 'List any licensed foreign software, proprietary modules, or third-party engines.',
    placeholder: 'e.g. Uses standard open source packages (MIT/Apache), no foreign proprietary components...',
    type: 'textarea',
    required: false,
  },
  {
    id: 'sbomAvailability',
    question: 'Software Bill of Materials (SBOM) Availability',
    description: 'Is a clear, updated SBOM maintained and ready to be made available?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 'sbomFormat',
    question: 'If Available, SBOM Format',
    description: 'Indicate the format utilized (e.g. SPDX, CycloneDX, Custom JSON). Skip if not applicable.',
    placeholder: 'e.g. CycloneDX JSON',
    type: 'text',
    required: false,
    dependsOn: { field: 'sbomAvailability', value: 'Yes' },
  },
  {
    id: 'pocAvailability',
    question: 'Availability for Demonstration and Proof of Concept (PoC)',
    description: 'Are you prepared to offer a live evaluation demo or host a sandboxed PoC?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 'awards',
    question: 'Awards, Recognitions, or Certifications Received',
    description: 'List certifications (e.g. Common Criteria, STQC) or awards received.',
    placeholder: 'e.g. STQC certified. Awarded Top Startup in Cyber Security...',
    type: 'textarea',
    required: false,
  },
  {
    id: 'benchmarking',
    question: 'Product Benchmarking & References',
    description: 'Include performance ratings, third-party benchmarks, or public reference documentation.',
    placeholder: 'e.g. Audited throughput benchmarks available via whitepaper link...',
    type: 'textarea',
    required: false,
  },
  {
    id: 'deployments',
    question: 'Existing Deployments / Installations',
    description: 'Provide approximate numbers or list target industry sectors (if shareable).',
    placeholder: 'e.g. Deployed across 5 Critical Information Infrastructure sites and 20+ private firms...',
    type: 'textarea',
    required: false,
  },
  {
    id: 'aiAssessment',
    question: 'Whether AI assisted VA & Source Code assessment has been conducted',
    description: 'Select status of modern automated code and configuration vulnerability scans.',
    type: 'radio',
    options: ['Yes (Reports Available)', 'Yes (Reports Private)', 'No'],
    required: true,
  },
  {
    id: 'rvdPolicy',
    question: 'Whether Responsible Vulnerability Disclosure (RVD) policy is active',
    description: 'Do you have an active RVD policy and established secure patch process?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
  },
];

export default function ApplyPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [answers, setAnswers] = useState({});
  const [viewSummary, setViewSummary] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Authenticate on mount
  useEffect(() => {
    async function checkAuth() {
      const sess = await getSession();
      if (!sess) {
        router.push('/login');
      } else {
        setSession(sess);
        // Prepopulate email values
        setAnswers({
          email: sess.user.email,
          contactEmail: sess.user.email,
        });
        // Start at step 0 with the prefilled values
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Autoscroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentStep, answers, viewSummary]);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading security portal...</p>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];
  const totalQuestions = QUESTIONS.length;

  // Calculate completion percentage
  const filledCount = QUESTIONS.filter(q => {
    if (q.dependsOn) {
      const depVal = answers[q.dependsOn.field];
      if (depVal !== q.dependsOn.value) return true; // Skipped, count as handled
    }
    return answers[q.id] !== undefined && answers[q.id] !== '';
  }).length;
  const progressPercent = Math.round((filledCount / totalQuestions) * 100);

  // Check if current question's dependency is met
  const isQuestionVisible = (q) => {
    if (!q.dependsOn) return true;
    return answers[q.dependsOn.field] === q.dependsOn.value;
  };

  const handleNext = () => {
    // Validate required fields
    const value = answers[currentQuestion.id];
    if (currentQuestion.required && isQuestionVisible(currentQuestion)) {
      if (value === undefined || value === null || value.toString().trim() === '') {
        alert(`${currentQuestion.question} is required.`);
        return;
      }
    }

    // Word limit check for description
    if (currentQuestion.wordLimit && value) {
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      if (words > currentQuestion.wordLimit) {
        alert(`Description exceeds the word limit of ${currentQuestion.wordLimit} words.`);
        return;
      }
    }

    // Go to next visible question
    let nextIndex = currentStep + 1;
    while (nextIndex < totalQuestions && !isQuestionVisible(QUESTIONS[nextIndex])) {
      nextIndex++;
    }

    if (nextIndex < totalQuestions) {
      setCurrentStep(nextIndex);
    } else {
      setViewSummary(true);
    }
    setActiveInput('');
  };

  const handleBack = () => {
    let prevIndex = currentStep - 1;
    while (prevIndex >= 0 && !isQuestionVisible(QUESTIONS[prevIndex])) {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      setCurrentStep(prevIndex);
      setViewSummary(false);
    }
    setActiveInput('');
  };

  const handleInputChange = (val) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  const jumpToQuestion = (index) => {
    setCurrentStep(index);
    setViewSummary(false);
    setActiveInput('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      router.push('/thank-you');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred during submission.');
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (currentQuestion.type !== 'textarea') {
        e.preventDefault();
        handleNext();
      }
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div className="container" style={styles.navInner}>
          <div style={styles.brandingWrapper} onClick={() => router.push('/')}>
            <div style={styles.brandTextContainer}>
              <span style={styles.portalTitle}>Registry Portal</span>
              <span style={styles.portalSubtitle}>CERT-In & ICAN Indigenous Cybersecurity Product Registry</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={styles.userEmail}>{session?.user?.name || session?.user?.email}</span>
            <button className="btn btn-outline" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px' }} onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Unified Chat Area Container */}
      <div style={styles.mainContainer}>
        {/* Progress Bar at the top of the chat area */}
        <div style={styles.progressContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Form Completion</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{progressPercent}% Completed</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div style={styles.chatArea} ref={chatAreaRef}>
          {/* Welcome Message */}
          <div style={styles.botBubble}>
            <div style={styles.botHeader}>
              <span style={styles.botName}>Registry Assistant</span>
            </div>
            <p style={{ margin: 0, fontSize: '1.15rem', lineHeight: 1.6 }}>
              Welcome to the Indigenous Product Registry application! I will guide you step-by-step through the 20 questions required for the CERT-In & ICAN Indigenous cybersecurity evaluation.
            </p>
          </div>

          {/* Render All Questions and Answers completed so far */}
          {QUESTIONS.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
            const isVisible = isQuestionVisible(q);
            if (!isVisible) return null;

            // Only show up to current step
            if (idx > currentStep) return null;

            return (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* System / Bot Question Bubble */}
                <div style={styles.botBubble}>
                  <div style={styles.botHeader}>
                    <span style={styles.botName}>Question {idx + 1} of {totalQuestions}</span>
                    {q.required && <span style={styles.requiredBadge}>Required</span>}
                  </div>
                  <h3 style={styles.bubbleQuestionTitle}>{q.question}</h3>
                  <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.description}</p>
                </div>

                {/* User Answer Bubble */}
                {isAnswered && idx !== currentStep && (
                  <div style={styles.userBubble} onClick={() => jumpToQuestion(idx)} title="Click to edit this response">
                    <div style={styles.userBubbleHeader}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Your Answer</span>
                      <span style={styles.editIndicator}>Edit ✎</span>
                    </div>
                    <p style={styles.userBubbleText}>{answers[q.id].toString()}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show the Summary block inside the chat log if viewSummary is active */}
          {viewSummary && (
            <div style={styles.summaryCard} className="glass-card animate-fade-in">
              <h2 style={{ ...styles.questionTitle, marginBottom: '0.5rem', fontSize: '1.4rem' }}>Review Responses</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Please review all responses carefully before submitting. A secure PDF report will be generated and dispatched to the Registry Administrators.
              </p>

              {submitError && (
                <div style={styles.errorBox}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {submitError}
                </div>
              )}

              <div style={styles.summaryList}>
                {QUESTIONS.map((q, idx) => {
                  const val = answers[q.id];
                  const isVisible = isQuestionVisible(q);
                  if (!isVisible) return null;

                  return (
                    <div key={q.id} style={styles.summaryItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.summaryLabel}>Q{idx + 1}: {q.question}</span>
                        <button style={styles.editInlineBtn} onClick={() => jumpToQuestion(idx)}>
                          Edit ✎
                        </button>
                      </div>
                      <p style={styles.summaryValue}>{val ? val.toString() : <span style={{ color: '#ef4444' }}>Empty / Required</span>}</p>
                    </div>
                  );
                })}
              </div>

              <div style={styles.summaryControls}>
                <button className="btn btn-outline" style={{ borderRadius: '8px' }} onClick={() => setViewSummary(false)}>
                  ← Back to Chat
                </button>
                <button
                  className="btn btn-primary"
                  style={{ borderRadius: '8px', minWidth: '180px' }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span style={styles.miniSpinner} />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Sticky Input Bar at the Bottom */}
        {!viewSummary && (
          <div style={styles.stickyInputArea}>
            <div style={styles.inputTitle}>
              <span>Responding to: <strong>{currentQuestion.question}</strong></span>
              {currentQuestion.required && <span style={{ color: 'var(--accent-orange)' }}>* Required field</span>}
            </div>

            <div style={styles.inputRow}>
              {/* Dynamic input render based on type */}
              <div style={{ flex: 1 }}>
                {(currentQuestion.type === 'text' || currentQuestion.type === 'email') && (
                  <input
                    type={currentQuestion.type}
                    className="form-input"
                    placeholder={currentQuestion.placeholder}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.1)' }}
                    autoFocus
                  />
                )}

                {currentQuestion.type === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="range"
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      style={{ flex: 1, accentColor: 'var(--accent-blue)', height: '8px' }}
                      value={answers[currentQuestion.id] || 0}
                      onChange={(e) => handleInputChange(parseInt(e.target.value))}
                    />
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '80px', textAlign: 'center', background: 'rgba(0,0,0,0.25)' }}
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      value={answers[currentQuestion.id] || 0}
                      onChange={(e) => handleInputChange(parseInt(e.target.value) || 0)}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>%</span>
                  </div>
                )}

                {currentQuestion.type === 'select' && (
                  <select
                    className="form-input"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.1)' }}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                  >
                    <option value="" disabled>Select option...</option>
                    {currentQuestion.options.map(opt => (
                      <option key={opt} value={opt} style={{ background: '#111827', color: '#fff' }}>{opt}</option>
                    ))}
                  </select>
                )}

                {currentQuestion.type === 'textarea' && (
                  <div>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ resize: 'none', width: '100%', background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.1)' }}
                      placeholder={currentQuestion.placeholder}
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    {currentQuestion.wordLimit && (
                      <div style={styles.wordCount}>
                        Word Count: {answers[currentQuestion.id] ? answers[currentQuestion.id].trim().split(/\s+/).filter(Boolean).length : 0} / {currentQuestion.wordLimit} max
                      </div>
                    )}
                  </div>
                )}

                {currentQuestion.type === 'radio' && (
                  <div style={styles.radioGroup}>
                    {currentQuestion.options.map(opt => (
                      <label key={opt} style={{
                        ...styles.radioOption,
                        borderColor: answers[currentQuestion.id] === opt ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                        background: answers[currentQuestion.id] === opt ? 'rgba(59,130,246,0.12)' : 'rgba(0,0,0,0.2)',
                      }}>
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={opt}
                          checked={answers[currentQuestion.id] === opt}
                          onChange={() => handleInputChange(opt)}
                          style={{ accentColor: 'var(--accent-blue)' }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  style={{ ...styles.backBtn, opacity: currentStep === 0 ? 0.3 : 1 }}
                  title="Previous Question"
                >
                  ←
                </button>
                <button className="btn btn-outline" style={styles.backBtn} onClick={() => setViewSummary(true)} title="Show Summary">
                  Summary
                </button>
                <button className="btn btn-primary" style={styles.sendBtn} onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingWrapper: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)'
  },
  spinner: {
    width: 48, height: 48, border: '4px solid rgba(255,255,255,0.05)',
    borderTopColor: 'var(--accent-blue)', borderRadius: '50%',
    animation: 'spin-slow 0.8s linear infinite'
  },
  miniSpinner: {
    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin-slow 0.8s linear infinite', display: 'inline-block', marginRight: '8px'
  },
  wrapper: {
    background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column'
  },
  nav: {
    position: 'sticky', top: 0, zIndex: 10,
    background: 'rgba(8, 11, 22, 0.9)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.4rem 0',
  },
  navInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  
  // Refined branding banner wrapper
  brandingWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    cursor: 'pointer',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    background: 'transparent',
    border: 'none',
    padding: 0,
    marginRight: '0.5rem',
  },
  logoCapsule: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: '48px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1) opacity(0.95)',
  },
  brandTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  portalTitle: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem',
    color: '#ffffff', letterSpacing: '0.02em', lineHeight: 1.15,
  },
  portalSubtitle: {
    fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500,
    marginTop: '0.15rem',
  },
  userEmail: { color: 'var(--text-secondary)', fontSize: '0.85rem' },

  // Unified full page layout
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1250px',
    width: '95%',
    margin: '0 auto',
    padding: '1.5rem 1rem 0 1rem',
    position: 'relative',
    height: 'calc(100vh - 65px)',
  },
  progressContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
  },
  progressBarBg: {
    height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px',
    overflow: 'hidden', marginTop: '0.5rem'
  },
  progressBarFill: {
    height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
    borderRadius: '99px', transition: 'width var(--transition-slow)'
  },

  chatArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingBottom: '160px', // spacing so content doesn't hide behind sticky input
    paddingRight: '0.25rem',
  },

  botBubble: {
    alignSelf: 'flex-start',
    width: 'fit-content',
    maxWidth: '80%',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px 16px 16px 2px',
    padding: '1.25rem 1.65rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontSize: '1.15rem',
  },
  botHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  botName: {
    fontSize: '0.9rem', textTransform: 'uppercase',
    letterSpacing: '0.05em', color: 'var(--accent-blue)', fontWeight: 600
  },
  bubbleQuestionTitle: {
    fontSize: '1.45rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#ffffff'
  },
  requiredBadge: {
    fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px',
    background: 'rgba(249,115,22,0.1)', color: 'var(--accent-orange)',
    border: '1px solid rgba(249,115,22,0.2)', fontWeight: 500
  },

  userBubble: {
    alignSelf: 'flex-end',
    width: 'fit-content',
    maxWidth: '80%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.1) 100%)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '16px 16px 2px 16px',
    padding: '1.15rem 1.5rem',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
  userBubbleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.35rem',
  },
  userBubbleText: {
    margin: 0, fontWeight: 500, fontSize: '1.15rem', color: '#ffffff',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  editIndicator: {
    fontSize: '0.85rem', color: 'var(--accent-cyan)', opacity: 0.8
  },

  // Sticky bottom responding area
  stickyInputArea: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '0.9rem 1.25rem',
    boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  inputTitle: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  sendBtn: {
    padding: '0.65rem 1.4rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  backBtn: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    cursor: 'pointer',
  },

  radioGroup: {
    display: 'flex', flexDirection: 'row', gap: '0.75rem', flexWrap: 'wrap'
  },
  radioOption: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)',
    cursor: 'pointer', fontSize: '0.85rem', transition: 'all var(--transition-fast)'
  },
  wordCount: {
    fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '0.25rem'
  },

  // Summary Review Styles
  summaryCard: {
    padding: '1.25rem',
    background: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    marginTop: '1rem',
  },
  summaryList: {
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem',
    margin: '1.25rem 0'
  },
  summaryItem: {
    background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)',
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)'
  },
  summaryLabel: {
    fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600
  },
  summaryValue: {
    margin: 0, marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)',
    wordBreak: 'break-word',
  },
  editInlineBtn: {
    background: 'none', border: 'none', color: 'var(--accent-cyan)',
    cursor: 'pointer', fontSize: '0.75rem'
  },
  summaryControls: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--border-color)', paddingTop: '1rem'
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem'
  }
};
