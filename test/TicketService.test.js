import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";

// Mock the external services
jest.mock("../src/thirdparty/paymentgateway/TicketPaymentService.js");
jest.mock("../src/thirdparty/seatbooking/SeatReservationService.js");

describe("TicketService", () => {
  let ticketService;

  beforeEach(() => {
    TicketPaymentService.mockClear();
    SeatReservationService.mockClear();

    ticketService = new TicketService();
  });

  test("successful purchase: 2 adults, 2 child", () => {
    // Arrange: valid account and ticket mix
    // Adult = 25, Child = 15
    // Total = 2*25 + 2*15 = 80
  
    const result = ticketService.purchaseTickets(
      3,
      new TicketTypeRequest("ADULT", 2),
      new TicketTypeRequest("CHILD", 2),
    );
  
    // Assert: correct totals returned
    expect(result.amountToPay).toBe(80);
    expect(result.requiredSeats).toBe(4);
  
    // Assert: external services called with correct values
    expect(TicketPaymentService.mock.instances[0].makePayment)
      .toHaveBeenCalledWith(3, 80);
  
    expect(SeatReservationService.mock.instances[0].reserveSeat)
      .toHaveBeenCalledWith(3, 4);
  });

  test("infants do not require seats", () => {
    const result = ticketService.purchaseTickets(
      5,
      new TicketTypeRequest("ADULT", 1),
      new TicketTypeRequest("INFANT", 3)
    );

    expect(result.requiredSeats).toBe(1);
    expect(result.amountToPay).toBe(25);
  });

  test("throws when no adult but child present", () => {
    expect(() =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("CHILD", 2)
      )
    ).toThrow(InvalidPurchaseException);
  });

  test("throws when no adult but infant present", () => {
    expect(() =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("INFANT", 1),
      )
    ).toThrow(InvalidPurchaseException);
  });

  test("throws when more than 25 tickets are purchased", () => {
    expect(() =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 13),
        new TicketTypeRequest("CHILD", 13)
      )
    ).toThrow(InvalidPurchaseException);
  });

  test("throws for invalid accountId", () => {
    expect(() =>
      ticketService.purchaseTickets(
        0,
        new TicketTypeRequest("ADULT", 1)
      )
    ).toThrow(InvalidPurchaseException);
    // test for negative accountId
    expect(() =>
      ticketService.purchaseTickets(
        -5,
        new TicketTypeRequest("ADULT", 1)
      )
    ).toThrow(InvalidPurchaseException);
  });

  test("throws for invalid ticket request object", () => {
    expect(() =>
      ticketService.purchaseTickets(1, { type: "ADULT", count: 1 })
    ).toThrow(InvalidPurchaseException);
  });

  test("throws for zero or negative ticket count", () => {
    expect(() =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", 0)
      )
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", -3)
      )
    ).toThrow(InvalidPurchaseException);
  });

  test("correct totals returned for mixed tickets", () => {
    const result = ticketService.purchaseTickets(
      20,
      new TicketTypeRequest("ADULT", 3),
      new TicketTypeRequest("CHILD", 2),
      new TicketTypeRequest("INFANT", 1)
    );

    expect(result.amountToPay).toBe(3 * 25 + 2 * 15);
    expect(result.requiredSeats).toBe(5);
    expect(result.adultTicket).toBe(3);
    expect(result.childTicket).toBe(2);
    expect(result.infantTicket).toBe(1);
  });
});
