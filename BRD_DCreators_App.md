# Business Requirements Document (BRD) - DCreators App Dashboard

## 1. Project Overview
The DCreators App Dashboard is a platform designed to seamlessly connect Clients with Creative Consultants (such as designers, photographers, and art directors). The application facilitates the entire lifecycle of a creative project, from consultant discovery and project assignment to iterative design reviews, milestone-based payments, and final asset delivery. 

## 2. User Roles
The platform primarily supports the following user personas:
*   **Client:** Users seeking creative services. They can browse consultants, assign projects, provide structured feedback on design submissions, and make payments.
*   **Creative Consultant:** Professionals offering their services. They receive assignment briefs, propose timelines and final offers, submit their artwork for review, and deliver final assets upon payment completion.
*   **Admin (Implied):** Platform administrators who manage users, oversee transactions, and handle disputes.

## 3. Core Modules & Functional Requirements

### 3.1 Dashboard & Navigation
*   **Bottom Navigation Bar:** Persistent navigation with "Home", "Search", and "History" tabs.
*   **Action Banner:** A permanent bottom/floating section providing quick actions to "Assign Project / Hire Creative Consultant" and access the "Shop".
*   **Top Bar:** Features a hamburger menu, an "Alerts" section showing real-time notifications (bell icon), and a user profile preview.

### 3.2 Consultant Discovery & Selection
*   **Discovery Hub:** Home dashboard displays categorized sections like "Creators in Demand", "Photographer's Archive", and "Designer's Hub".
*   **Direct Hiring:** Clients can tap on specific creatives from the dashboard to initiate a hiring request directly.
*   **Budget-Matched Suggestions:** When a client enters an assignment budget, the system suggests available creative consultants within that range (e.g., displaying names, experience, expertise, and their specific assignment cost).

### 3.3 Project Assignment & Briefing
*   **Step 1: Assignment Details:** Clients must fill out a form specifying:
    *   Assignment Type (e.g., Design)
    *   Assignment Details (e.g., Brand Manual, Print Ads)
    *   Assignment Date / Deadline
    *   Assignment Brief
    *   Assignment Budget
*   **Terms and Conditions:** Clients must read and "Accept" terms and conditions before submission.

### 3.4 Negotiation & Workorder Generation
*   **Consultant Notification:** Upon client submission, the selected consultant receives an alert containing the creative brief.
*   **Timeline & Offer Submission:** The consultant must submit the exact dates for milestones (1st review, 2nd review, Final review) and confirm the "Final offer" cost.
*   **Advance Payment:** The client must pay an advance amount directly through the app.
*   **Workorder Generation:** Only after the advance payment is completed is the official "Workorder" generated and issued to both the consultant and the client.

### 3.5 Iterative Review & Feedback System
*   **Submission Tracking:** A visual progress bar at the top displays the completion percentage (e.g., 60% done, 80% done, 100% done).
*   **Structured Feedback Forms:** For each review round (1st, 2nd, Final), clients can:
    *   Select their preferred option (Option 1, Option 2, Option 3).
    *   Suggest modifications categorized by: Colour, Concept, or Design Look.
    *   Provide text-based reverts (e.g., "Share a different concept").
*   **Client Actions:** On viewing a design, clients can put it on "Hold", "Cancel", "Revert", or "Approve".

### 3.6 Final Approval, Payment & Delivery
*   **Final Artwork Upload:** Once the client approves the design, the consultant uploads the high-resolution/final artwork.
*   **Balance Payment Check:** The final artwork is locked until the client pays the remaining balance.
*   **Asset Unlocking:** Upon successful balance payment, the "Download" button becomes active (turns green), and the client can download the final deliverables. This marks the task as accomplished.

## 4. Technical Dependencies & Considerations

*   **Real-time Notifications:** WebSockets or Push Notifications are required to facilitate instant alerts between clients and consultants (e.g., for new assignments, feedback submissions, and payment updates).
*   **Payment Gateway Integration:** Secure processing of milestone-based payments (Advance & Balance). Consideration for escrow functionality might be necessary given the two-step payment structure.
*   **File Storage & Management:** A robust cloud storage solution (like AWS S3) is needed to handle large design files and final deliverables. It must support access control (locking files until payment is made).
*   **State Management:** The app requires complex state management on both client and consultant ends to track the exact phase of a project visually and restrict actions appropriately.

## 5. UI/UX Specifications Summary
*   **Visual Status Indicators:** Use of color-coded buttons and progress bars to show project health.
*   **Structured UI Formats:** Feedback should be highly structured (checkboxes, dropdowns) to minimize "minimum effort" and avoid ambiguous textual communication, streamlining the creative process.
*   **Layout:** Clean, standard "app" layout containing header (branding/profile/alerts), scrollable content area, floating action buttons, and persistent bottom navigation.
