# Newsletter Subscription Service

This project implements a newsletter subscription service using Node.js and Express. It provides an API endpoint for users to subscribe to the newsletter by providing their username and email address. Upon subscription, a confirmation email containing a unique confirmation link is sent to the provided email address. Users can confirm their subscription by clicking on the confirmation link.

## Features

- **Subscription Endpoint**: Allows users to subscribe to the newsletter by providing their username and email address via a POST request to the `/` endpoint.

- **Email Confirmation**: Sends a confirmation email with a unique confirmation link to the provided email address upon successful subscription.

- **Confirmation Endpoint**: Provides a GET endpoint `/newsletter-confirmation` for users to confirm their subscription by clicking on the confirmation link sent via email.

## Technologies Used

- **Node.js**: JavaScript runtime environment for building server-side applications.
- **Express**: Web framework for Node.js used to build the API endpoints.
- **dotenv**: Loads environment variables from a `.env` file to keep sensitive information secure.
- **nodemailer**: Module for sending emails with Node.js.
- **express-validator**: Middleware for validating and sanitizing input data in the Express application.
- **helmet**: Middleware for securing Express apps with various HTTP headers.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS) in the Express app.

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
