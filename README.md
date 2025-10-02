## **TileVision: AI-Powered Interior Design Visualizer**

TileVision is a cutting-edge web application that leverages the power of generative AI to help homeowners, designers, and contractors visualize how new tiles will look in a room before making a purchase. By simply uploading a photo and describing the desired changes in plain English, users can see a realistic rendering of their space in seconds.

This project demonstrates a real-world use case for advanced multimodal AI, built with Next.js, Google's Genkit, and the innovative Gemini (NanoBanana) model.

---

## The Vision: Making Remodeling Simple

Choosing the right tiles is one of the hardest parts of a remodel. It's difficult to imagine how a small sample will look across an entire floor or wall. TileVision solves this problem by bridging the gap between imagination and reality.

Our goal is to remove the guesswork, reduce costly mistakes, and empower users to design with confidence.

---

## How It Works: The Magic of Multimodal AI

At its core, TileVision is powered by **Google's Gemini model**, a sophisticated AI that can understand and process information from multiple sources at once—including text, images, and structured commands.

Here’s a simple breakdown of the process:

1.  **Image Understanding:** When you upload a photo of your room, the Gemini model analyzes the image to identify key architectural features. It intelligently segments the scene into distinct areas like "floor," "walls," and "ceiling," understanding their shapes, perspective, and lighting.

2.  **Natural Language Parsing:** You don't need to be a tech expert. You can simply type your instructions in the prompt bar, such as:
    > "Apply the Natural Oak tile on the floor and put Calacatta Gold marble on the walls."

    The AI parses this sentence, identifies your intent (`apply_textures`), and extracts the specific tiles and surfaces you mentioned.

3.  **AI-Powered Image Generation:** This is where the "NanoBanana" image-editing capabilities of the Gemini model shine. The application sends the original room photo, the desired tile textures, and your instructions to the model. The AI then "repaints" the identified floor and wall surfaces with the new tiles, seamlessly blending them into the scene while preserving the original room's perspective, shadows, and ambient lighting.

The result is a photorealistic "after" image that shows you exactly how your design choices will look in real life.

---

## A Tour of TileVision

Here’s a walkthrough of the user experience from start to finish.

### 1. Admin Login

Secure access to the platform for administrators to manage tiles, users, and credits.
<img width="737" height="326" alt="Screenshot 2025-10-01 at 22 13 53" src="https://github.com/user-attachments/assets/93a2170e-95cd-42c8-a856-349b11523a4d" />


### 2. Upload Your Room

Start a new project by uploading a photo of the space you want to transform.
<img width="1429" height="716" alt="Screenshot 2025-10-01 at 22 30 57" src="https://github.com/user-attachments/assets/04971ee1-e34f-44e9-a9ee-ff4a586611ed" />


### 3. Design with a Prompt

Use the intuitive prompt interface to describe the changes you want to see. You can select from existing tiles or type their names directly.
<img width="398" height="693" alt="Screenshot 2025-10-01 at 22 32 08" src="https://github.com/user-attachments/assets/6ce5b316-716f-484c-a60b-25dd7229161a" />



### 4. See the Results

Instantly visualize the transformation with a before-and-after slider. The AI renders your vision, ready for you to review.
![Uploading Screenshot 2025-10-01 at 22.32.51.png…]()


---

## Tech Stack & Architecture

This project is built on a modern, robust, and scalable technology stack.

-   **Frontend:** Next.js, React, TypeScript, ShadCN UI, Tailwind CSS
-   **Backend & AI Orchestration:** Genkit (a Google framework for building AI-powered applications)
-   **Generative AI Model:** Google Gemini 1.5 Flash (including the "NanoBanana" image generation model)
-   **Deployment:** Firebase App Hosting

---

## Getting Started: Running the Project Locally

Follow these steps to set up and run the project on your local machine.

### Prerequisites

-   Node.js (v18 or later)
-   An active Google AI Studio API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
    cd <YOUR_REPOSITORY_NAME>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of the project and add your Google AI Studio API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    The application runs with two concurrent processes: the Next.js frontend and the Genkit AI backend.

    -   In your first terminal, start the Next.js app:
        ```bash
        npm run dev
        ```
        This will typically start the frontend on `http://localhost:9002`.

    -   In a second terminal, start the Genkit development server:
        ```bash
        npm run genkit:dev
        ```

5.  **Open the application:**
    Navigate to `http://localhost:9002` in your browser to start using TileVision.
