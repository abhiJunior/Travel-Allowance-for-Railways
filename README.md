# Railway TA Journal Tracker

The Railway TA Journal Tracker is a specialized web application designed to help Railway employees (specifically Technical or Site staff) automate the calculation and documentation of their Travelling Allowance (TA) claims.

## Overview

In the Railways, TA is not just a flat monthly payment; it is calculated based on time spent away from the headquarters, specific train journey timings, and "Stay" periods at field sites.

### What is it?

The application serves as a digital logbook. Instead of manually writing down every journey on a piece of paper at the end of the month, the user logs entries daily via a mobile-friendly interface.

#### Core Features:
- **Journey Logging**: Captures Train numbers, departure/arrival times, and "From/To" stations.
- **Stay Management**: Records days spent working at a specific site without travel.
- **Automated Calculation**: The backend automatically calculates the percentage of TA (e.g., 30%, 70%, or 100%) based on the hours spent away from HQ.
- **PDF Generation**: With one click, it converts the month's data into a professionally formatted PDF that matches the official Railway claim format.

## Why did I build it?

I built this to solve three primary pain points:

1. **Complexity of Rules**: TA rules are based on time brackets (e.g., less than 6 hours = 30%, 6–12 hours = 70%, over 12 hours = 100%). Calculating this manually for 30 days is prone to human error.

2. **Manual Documentation**: Many employees still use handwritten journals. If a journal is lost, the data is gone. This app provides a secure cloud backup via MongoDB.

3. **Efficiency**: Generating the final "TA Bill" usually takes an hour of tedious work. This app reduces that time to seconds by automating the PDF generation.

## Key Technical Features

- **Secure Authentication**: Uses JWT (JSON Web Tokens) to ensure that only the employee can see and edit their journal.
- **Full CRUD Operations**: Users can Create, Read, Update, and Delete entries as their tour plans change.
- **Dynamic UI**: Built with React and Ant Design for a clean, professional look that works on both desktops and smartphones.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

```bash
npm run dev
```

The application will start on `http://localhost:5173` (default Vite port).

## Build

To create a production build:

```bash
npm run build
```

## Tech Stack

- **Frontend**: React, Vite, Ant Design
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

---

For more information about the backend setup, refer to the server directory README.
