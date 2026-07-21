import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generatePDF } from '@/lib/pdf-generator';
import { sendReportEmail } from '@/lib/email-sender';
import pool from '@/lib/db';
import { submitRateLimiter } from '@/lib/rate-limit';
import {
  isValidString,
  validateAndSanitize,
  FIELD_LIMITS,
  REQUIRED_APPLICATION_FIELDS,
} from '@/lib/sanitize';

// Global lock map for preventing concurrent submissions (Finding 6)
const submissionLocks = new Map();

/**
 * POST /api/submit-application
 * Receives the 20-field application form data from the front-end,
 * verifies the authenticated session, saves to PostgreSQL,
 * generates a PDF, and emails it to the Admin.
 */
export async function POST(request) {
  let lockKey = null;

  try {
    // Finding 13: Strictly validate Content-Type header
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported Media Type: Only application/json is allowed' },
        { status: 415 }
      );
    }

    // 1. Verify user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to submit an application' },
        { status: 401 }
      );
    }

    // Rate Limiting (Finding 4)
    const rateLimit = submitRateLimiter.check(session.user.email);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    // 2. Parse payload (Finding 3: Graceful handling of malformed JSON)
    let payload;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid or malformed JSON body' },
        { status: 400 }
      );
    }
    console.log('[API Submit] Received application from user:', session.user.email);

    // Type Confusion check (Finding 8, 12):
    // Validate that the payload is a plain object (not array, null, etc.)
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected a JSON object' },
        { status: 400 }
      );
    }

    // Required Field Validation (Finding 10):
    // Reject empty body or missing required fields. Empty strings and whitespace-only are rejected.
    const missingFields = [];
    for (const field of REQUIRED_APPLICATION_FIELDS) {
      if (!isValidString(payload[field])) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or empty required fields: ${missingFields.join(', ')}. Please fill in all required information.` },
        { status: 400 }
      );
    }

    // Input Length Validation + XSS Sanitization (Finding 7, 9, 12):
    // Validate, sanitize, and enforce length limits on every application field.
    const applicationFields = [
      'organizationName', 'contactPersonName', 'contactEmail',
      'productName', 'productCategory', 'productCategoryOther', 'deploymentModel',
      'briefDescription', 'keyFeatures', 'indigenousContent',
      'ipOwnership', 'foreignComponents', 'sbomAvailability',
      'sbomFormat', 'pocAvailability', 'awards', 'benchmarking',
      'deployments', 'aiAssessment', 'rvdPolicy',
    ];

    const sanitizedPayload = {};
    for (const field of applicationFields) {
      const rawValue = payload[field];

      // Type check: reject non-string types (Finding 8, 12)
      if (rawValue !== undefined && rawValue !== null && typeof rawValue !== 'string') {
        return NextResponse.json(
          { error: `Field '${field}' must be a string` },
          { status: 400 }
        );
      }

      const value = typeof rawValue === 'string' ? rawValue : '';
      const limit = FIELD_LIMITS[field] || 5000;
      const check = validateAndSanitize(value, limit);

      if (!check.valid) {
        return NextResponse.json(
          { error: `Field '${field}' ${check.error}` },
          { status: 400 }
        );
      }

      sanitizedPayload[field] = check.sanitized;
    }

    // In-memory lock to prevent race conditions (Finding 6)
    lockKey = `${session.user.email}-${sanitizedPayload.productName}`;
    if (submissionLocks.has(lockKey)) {
      return NextResponse.json(
        { error: 'A submission for this product is currently processing. Please wait.' },
        { status: 409 }
      );
    }
    submissionLocks.set(lockKey, true);

    // 3. Map fields to report data (using sanitized values — Finding 7)
    // Merge custom category into productCategory when "Others" is selected
    let finalProductCategory = sanitizedPayload.productCategory;
    if (sanitizedPayload.productCategory === 'Others \u2013 Not Listed' && sanitizedPayload.productCategoryOther) {
      finalProductCategory = `Others \u2013 ${sanitizedPayload.productCategoryOther}`;
    }

    const reportData = {
      email: session.user.email || '',
      organizationName: sanitizedPayload.organizationName,
      contactPersonName: sanitizedPayload.contactPersonName,
      contactEmail: sanitizedPayload.contactEmail || session.user.email || '',
      productName: sanitizedPayload.productName,
      productCategory: finalProductCategory,
      deploymentModel: sanitizedPayload.deploymentModel,
      briefDescription: sanitizedPayload.briefDescription,
      keyFeatures: sanitizedPayload.keyFeatures,
      indigenousContent: sanitizedPayload.indigenousContent,
      ipOwnership: sanitizedPayload.ipOwnership,
      foreignComponents: sanitizedPayload.foreignComponents,
      sbomAvailability: sanitizedPayload.sbomAvailability,
      sbomFormat: sanitizedPayload.sbomFormat,
      pocAvailability: sanitizedPayload.pocAvailability,
      awards: sanitizedPayload.awards,
      benchmarking: sanitizedPayload.benchmarking,
      deployments: sanitizedPayload.deployments,
      aiAssessment: sanitizedPayload.aiAssessment,
      rvdPolicy: sanitizedPayload.rvdPolicy,
    };

    // 4. Save all 20 answers to PostgreSQL
    // Parameterized query — all special characters are treated as plain text.
    console.log('[API Submit] Saving application to database...');

    // Look up the user_id from the users table
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [session.user.email]
    );
    const userId = userRows.length > 0 ? userRows[0].id : null;

    // Check for existing duplicate application in the database (Finding 6)
    if (userId) {
      const { rows: existingApps } = await pool.query(
        'SELECT id FROM applications WHERE user_id = $1 AND product_name = $2',
        [userId, reportData.productName]
      );
      
      if (existingApps.length > 0) {
        submissionLocks.delete(lockKey);
        return NextResponse.json(
          { error: 'You have already submitted an application for this product.' },
          { status: 409 }
        );
      }
    }

    await pool.query(
      `INSERT INTO applications (
        user_id, user_email, organization_name, contact_person_name,
        contact_email, product_name, product_category, deployment_model,
        brief_description, key_features, indigenous_content, ip_ownership,
        foreign_components, sbom_availability, sbom_format, poc_availability,
        awards, benchmarking, deployments, ai_assessment, rvd_policy
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )`,
      [
        userId,
        reportData.email,
        reportData.organizationName,
        reportData.contactPersonName,
        reportData.contactEmail,
        reportData.productName,
        reportData.productCategory,
        reportData.deploymentModel,
        reportData.briefDescription,
        reportData.keyFeatures,
        reportData.indigenousContent,
        reportData.ipOwnership,
        reportData.foreignComponents,
        reportData.sbomAvailability,
        reportData.sbomFormat,
        reportData.pocAvailability,
        reportData.awards,
        reportData.benchmarking,
        reportData.deployments,
        reportData.aiAssessment,
        reportData.rvdPolicy,
      ]
    );
    console.log('[API Submit] Application saved to database successfully');

    // 5. Generate PDF
    console.log('[API Submit] Generating PDF report...');
    const pdfBuffer = await generatePDF(reportData);
    console.log('[API Submit] PDF successfully generated, size:', pdfBuffer.length, 'bytes');

    // 6. Send email to Administrator (fire-and-forget for fast response)
    const adminEmail = process.env.ADMIN_REPORT_EMAIL;
    if (adminEmail) {
      console.log('[API Submit] Dispatching report to Admin...');
      sendReportEmail(adminEmail, reportData, pdfBuffer)
        .then(() => console.log('[API Submit] Admin email notification sent successfully'))
        .catch((emailErr) => console.error('[API Submit] Email send failed:', emailErr.message));
    } else {
      console.warn('[API Submit] ADMIN_REPORT_EMAIL not configured in environment variables');
    }

    // Data Exposure Fix (Finding 5): No internal details in response
    submissionLocks.delete(lockKey);
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('[API Submit] Error:', error);
    // Ensure we release the lock in case of an error
    if (lockKey) {
      submissionLocks.delete(lockKey);
    }
    
    return NextResponse.json(
      { error: 'Failed to process and submit application' },
      { status: 500 }
    );
  }
}
