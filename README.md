# Newsletter Subscription Service

This little project implements a newsletter subscription service using Node.js and Express. It provides an API endpoint for users to subscribe to the newsletter by providing their username and email address. Upon subscription, a confirmation email containing a unique confirmation link is sent to the provided email address. Users can confirm their subscription by clicking on the confirmation link (using Ethereal as fake SMTP service).

## Features

- **Subscription Endpoint**: Allows users to subscribe to the newsletter by providing their username and email address via a POST request.

- **Syntactic validation and DNS-check**: MX record must be present for the email address.

- **Email Confirmation**: Sends a confirmation email with a unique confirmation link to the provided email address upon successful subscription.

- **Confirmation Endpoint**: Provides a GET endpoint `/newsletter-confirmation` for users to confirm their subscription by clicking on the confirmation link sent via email.
  
- **Data Storage**: Subscriber information is stored in a CSV file with the format: `username,email,confirmationCode`.

## Technologies Used

- **Node.js**
- **Express**: Web framework for to build the API endpoints.
- **dotenv**: Loads environment variables from a `.env` file.
- **axios**: Promise-based HTTP client. 
- **nodemailer**: Module for sending emails with Node.js.
- **express-validator**: Middleware for validating and sanitizing input data in the Express application.
- **helmet**: Middleware for securing Express apps with various HTTP headers.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS) in the Express app.
- **Ethereal**: fake SMTP service.
- **dns.resolveMx()**: dns module to resolve mail exchange records for the specified hostname using DNS protocol.
- **crypto**: to generate the unique confirmation string

## Visuals/UI

- I used plain HTML and CSS, without any framework.
- Infos/Sucess/Errors are displayed in the user interface.

## Setup and Usage

1. Clone the repository: `git clone https://github.com/your/repository.git`
2. Install dependencies: `npm install`
3. Set environment variables in a `.env` file (Refer to `.env.example`).
4. Run the server: `npm start`
5. Access the API endpoints using a tool like Postman or via client applications.

## API Endpoints

- **POST /**: Endpoint for subscribing to the newsletter. Requires `username`, `email`, and `checkbox` (for privacy policy agreement) fields in the request body.

- **GET /newsletter-confirmation**: Endpoint for confirming the email subscription. Requires `code` and `email` query parameters in the URL.

## Authors

- [Valentina Benedikter](https://github.com/vlntnaBndktr) - Initial work
