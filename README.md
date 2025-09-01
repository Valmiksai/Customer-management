# Customer Management Application

A full-stack CRUD (Create, Read, Update, Delete) application built to manage customer information and their multiple addresses. This project demonstrates a complete end-to-end development process using a stack composed of React, Node.js, Express, and SQLite.

## Tech Stack

-   **Frontend:** React JS, React Router
-   **Backend:** Node.js, Express.js
-   **Database:** SQLite

## Features

-   **Full CRUD Operations:** Complete create, read, update, and delete functionality for both Customers and their Addresses.
-   **One-to-Many Relationship:** Each customer can have multiple associated addresses, which can be managed individually.
-   **Advanced Filtering:** A dynamic search interface to filter the customer list by address city, state, or pincode.
-   **Pagination:** The customer list is paginated to efficiently handle large amounts of data.
-   **Responsive Design:** The UI is fully responsive and optimized for a seamless experience on both desktop and mobile devices.
-   **Robust API:** A well-structured RESTful API built with Node.js and Express to handle all data operations.

## Setup and Installation

To run this project locally, follow these steps:

### Backend (`server`)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the backend server in development mode (it will run on `http://localhost:5000`):
    ```bash
    npx nodemon index.js
    ```
    The server will automatically create the `customers.db` file and set up the tables.

### Frontend (`client`)

1.  Open a new terminal and navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server (it will open in your browser at `http://localhost:3000`):
    ```bash
    npm start
    ```