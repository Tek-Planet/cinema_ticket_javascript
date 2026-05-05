import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js'
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

export default class TicketService {
  #prices = {
    INFANT:0,
    CHILD:15,
    ADULT:25,  
  }
// init services
  #paymentService = new TicketPaymentService();
  #seatReservationService = new SeatReservationService();


  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateAccount(accountId);
    this.#validateTicketRequest(ticketTypeRequests)

    const totals = this.#processTicket(ticketTypeRequests)
    // make payment
    this.#paymentService.makePayment(accountId, totals.amountToPay)
    this.#seatReservationService.reserveSeat(accountId, totals.requiredSeats)
    
    return totals
  }

  // validate user account
  #validateAccount(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0){
      throw new InvalidPurchaseException('Invalid account provided')
    }
  }

  // 
  #validateTicketRequest(tickets){
    if(!tickets.length){
      throw new InvalidPurchaseException('No ticket found')
    }

    for(const ticket of tickets){
      if(!(ticket instanceof TicketTypeRequest)){
        throw new InvalidPurchaseException ('Invalid ticket type selected')
      }

      // ensure no negative ticket number is entered
      if(ticket.getNoOfTickets() <= 0){
        throw new InvalidPurchaseException ('Ticket count must be a positive value')
      }
    }   
  }

  // process ticket
  #processTicket (tickets) {
    let adultTicket = 0, childTicket = 0, infantTicket = 0;

    for (const ticket of tickets){
      const ticketType = ticket.getTicketType();
      const ticketNumber =  ticket.getNoOfTickets()

      if (ticketType === 'ADULT') adultTicket += ticketNumber
      if (ticketType === 'CHILD') childTicket += ticketNumber
      if (ticketType === 'INFANT') infantTicket += ticketNumber

    }

    const totalTicket = adultTicket + childTicket + infantTicket
    // ensures total ticket does not exceed 25
    if(totalTicket > 25){
      throw new InvalidPurchaseException ('Cannot purchase more than 25 tickets')
    }
  // ensures adult tiket is included in the purchase 
    if(adultTicket === 0 && (childTicket>0 || infantTicket>0) ){
      throw new InvalidPurchaseException ('A child or infant must be accompanied by an adult')
    }

    // compute total amount
    const amountToPay = (adultTicket * this.#prices.ADULT) + (childTicket * this.#prices.CHILD) + (infantTicket * this.#prices.INFANT)
    // allocate seat 
    const requiredSeats = adultTicket + childTicket

    return {
      amountToPay, requiredSeats, adultTicket, childTicket, infantTicket
    }

  }
}
