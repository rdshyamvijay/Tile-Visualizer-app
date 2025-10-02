# **App Name**: TileVision

## Core Features:

- Tile Upload and Management: Admin console feature to upload and manage tile designs, including setting attributes like SKU, category, texture URL, and preview images. Supports bulk import via CSV and folder upload to Firebase Storage.
- Room Visualization: Customer app feature allowing users to upload room photos and visualize selected tile designs (floor and wall) applied to the room using Google's NanoBanana model. Includes options for grout width, tile orientation, and scale adjustments.
- AI-Powered Texture Application: Leverage Google's NanoBanana model via a server function to process room images, segmenting them into floor and wall masks and applying selected tile textures with proper perspective, scale, and lighting. The system will use the AI as a tool to automatically try again until an image meets expectations or give the end user different renderings, giving them the final decision of choosing between options.
- Credit Management: Admin console feature to manage user credits, including manual adjustments and a detailed credit ledger for tracking transactions (debits and credits). 1 credit = 1 render attempt. Keep a strict immutable ledger with double-entry style records: debit on queue, credit on refund or top-up, with reason, byUserId, and correlationId.
- Real-time Monitoring and Analytics: Admin console widgets for real-time org activity feed, credit balance alerts, and render job monitoring, providing insights into usage and performance. Log render latency and success rate to Firebase Analytics or BigQuery export.
- Role-Based Access Control: Implementation of Firebase Authentication with multi-tenant support and role-based access control, ensuring that users only have access to resources and features appropriate to their role (adminSuper, adminOrg, member, endUser). Each user belongs to zero or more organizations. All reads/writes are scoped to org unless adminSuper.
- Before/After Slider Component: Custom UI component that presents a side-by-side comparison of the original room photo and the rendered output with applied textures, allowing users to visually assess the impact of the tile selection. Present the room photo with before/after slider, download, share link, and 
Re-render with tweaks.

## Style Guidelines:

- Primary color: Deep blue (#1A237E) to convey trust, stability, and sophistication.
- Background color: Very light gray (#F5F5F5) for a clean, professional look.
- Accent color: Gold (#00FFEF) to highlight important actions and elements.
- Body text: 'Inter' sans-serif for its clean, readable appearance that scales well.
- Headline text: 'Space Grotesk' sans-serif for a bold, contemporary look.
- Use clear, modern icons from Material UI to represent different functions and data points. These icons are neutral and geometric, aligning with the overall aesthetic.
- Employ a clean, grid-based layout using Material UI's grid system. Ensure responsiveness across various devices (desktops, tablets, and mobile phones). The admin console follows a consistent layout across all routes.
- Incorporate subtle animations to enhance user experience without being distracting. For example, use smooth transitions when navigating between pages and display loading animations during data fetching and processing.