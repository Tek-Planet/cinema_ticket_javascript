#   Cinema Ticket Service

##  Application ID : 17109514  Campaign ID: 451133

This project contains my submission for the Java & JavaScript Software Engineer coding exercise. The solution implements the cinema ticket‑purchasing service in JavaScript, following the rules set out in the brief and ensuring the service interacts correctly with the external payment and seat‑reservation systems.

##  What the service does

TicketService takes an account ID and one or more TicketTypeRequest objects, then:

Validates the request

Calculates the total cost

Calculates how many seats are required

Calls the payment service

Calls the seat‑reservation service

Returns a summary of the purchase

The external services are provided in the template and are mocked in the test suite.

#   Business rules

These are the rules the service enforces:

Adult tickets cost £25

Child tickets cost £15

Infant tickets are free and dont get a seat

You cant buy child or infant tickets without at least one adult

Maximum of 25 tickets in one purchase

Account ID must be a positive integer

Ticket counts must be positive integers

Only valid TicketTypeRequest objects are accepted

If any rule is broken, an InvalidPurchaseException is thrown.

# Tests

The test suite cover:

Successful purchases

Infant seat behaviour

Scenarios with no adult present

Invalid account IDs

Invalid ticket objects

Zero or negative ticket counts

Exceeding the 25‑ticket limit

Mixed ticket combinations

The external services are mocked so the tests focus solely on the logic inside TicketService.

To run the tests:

```sh
# Step 1: Clone the repository 
git clone https://github.com/Tek-Planet/cinema_ticket_javascript.git

# Step 2: Navigate to the project diectory.
cd cinema_ticket_javascript

# Step 3: Install the necessary dependencies.
npm install

# Step 4: run test
npm test

```