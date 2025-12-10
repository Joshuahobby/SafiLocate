# System Architecture

The system follows a standard **Client-Server-Database** pattern with external integrations for Payments and AI.

\`\`\`ascii
       [User Mobile/Desktop]
              |
              v
      [Frontend: React/Vite]
      (Client-side Routing)
              |
      +-------+-------+
      |               |
[Public API]     [Admin API]
      |               |
      v               v
   [Backend: Node/Express] <-----> [AI Service (Tagging/Cleaning)]
      |       ^       |
      |       |       +----------> [Flutterwave Payment Gateway]
      |       |
      v       v
   [PostgreSQL Database]
   (Users, Items, Claims, Payments)
\`\`\`

## Core Data Flows
1.  **Found Item:** User Input -> Backend Validation -> AI Tagging -> DB (Status: Pending/Active).
2.  **Lost Item:** User Input -> Backend -> Payment Intent Created -> Frontend Redirect -> Payment Success -> Webhook -> DB Update (Status: Active).
3.  **Search:** User Query -> Backend SQL Query (Text + Tags) -> JSON Response -> Frontend Grid.
4.  **Claim:** User Claim -> Backend Store -> Notification (Email/Dashboard).
