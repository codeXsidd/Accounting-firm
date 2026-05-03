# Automated Client Onboarding System Prototype

This document outlines the implementation plan to create a working MVP prototype for the Automated Client Onboarding System for Accounting and Tax Firms. The prototype will be a high-fidelity web application simulating the entire end-to-end workflow described in your requirements.

## Goal Description

The objective is to build a premium, dynamic web application prototype that demonstrates the 10-module automated onboarding workflow. It will showcase a "firm side" (CRM trigger, tracking dashboard) and a "client side" (smart intake form, document uploads, e-signatures). The application will rely on a simulated, event-driven state machine to show how the system progresses automatically from a "Closed/Won" trigger to final handoff without manual intervention. 

> [!TIP]
> The prototype will focus heavily on **Rich Aesthetics**, utilizing modern design principles like glassmorphism, smooth micro-animations, and a sleek dark/light mode interface to give a "wow" factor suitable for investor or client pitches.

## User Review Required

> [!IMPORTANT]  
> Please review the proposed technology stack and the simulated workflow approach. The MVP will use React (via Vite) and vanilla CSS to create a highly responsive, standalone prototype. All "backend" automations (like email sending, auto-verifications) will be simulated via timed UI events to demonstrate the *experience* of the automation.

## Open Questions

> [!WARNING]
> 1. **Data Persistence**: For this MVP demo, I plan to use in-memory state (or `localStorage`) to allow you to walk through the flow seamlessly. Is this acceptable, or do you need a live database (e.g., Firebase) configured for the demo?
> 2. **Branding**: Are there any specific brand colors, themes, or firm names you'd like me to use to personalize the prototype's premium design?
> 3. **Framework**: I plan to use Vite + React + Vanilla CSS to build this out quickly and beautifully. Do you have any objections to this stack?

## Proposed Changes

### 1. Project Initialization & Architecture
- Initialize a new React project using Vite (`npx create-vite`).
- Set up a robust folder structure for components (`/components`), pages (`/pages`), styles (`/styles`), and mock data (`/data`).

### 2. Design System & CSS Foundation
- **[NEW] `index.css` & `theme.css`**: Implement a rich, premium design system featuring a carefully selected color palette (e.g., deep slate blues with vibrant accents), modern typography (Inter/Outfit), and utility classes for glassmorphism and animations.

### 3. Firm/Internal Dashboard (Modules 1, 7, 8)
- **[NEW] `CRM_Dashboard.jsx`**: A screen simulating the CRM where a deal can be marked as "Closed/Won", triggering the automation.
- **[NEW] `Internal_Tracker.jsx`**: A real-time tracking dashboard showing the onboarding progress of various clients, highlighting any bottlenecks or completed handoffs.

### 4. Client-Facing Portal (Modules 2, 3, 4, 6)
- **[NEW] `ClientIntakeForm.jsx`**: A multi-step, dynamic form that adapts based on "Individual" vs "Business" client types.
- **[NEW] `DocumentUpload.jsx`**: A beautiful drag-and-drop file upload interface that simulates automated validation (e.g., checking file type and completeness).
- **[NEW] `ESignature.jsx`**: A mock digital signature pad for engagement letters.

### 5. Automation Simulator (Modules 5, 9, 10)
- **[NEW] `WorkflowEngine.jsx` (Logic)**: A state management hook that simulates the automated triggers (e.g., after intake form submission, automatically progress to document upload and show a "Sent Notification" toast).

## Verification Plan

### Automated Tests
- N/A for MVP, though component linting and build checks will run successfully.

### Manual Verification
- You will be able to run `npm run dev` and navigate through the web app.
- We will manually test the complete user flow:
  1. Trigger "Closed/Won" in CRM.
  2. Switch to the Client view to fill out the dynamic form.
  3. Upload mock documents.
  4. Sign the digital agreement.
  5. Check the Internal Dashboard to see the status update to "Completed / Task Generated".
