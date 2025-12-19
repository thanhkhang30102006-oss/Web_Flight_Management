const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("./models");
const Ticket = db.Ticket;
const Seat = db.Seat;
cron.schedule("*/5 * * * *", async () => {
  const expiredTime = new Date(Date.now() - 60 * 60 * 1000);

  const cancelledTickets = await Ticket.findAll({
    where: {
      ticketState: "cancelled",
      cancelledAt: { [Op.lte]: expiredTime },
    },
  });

  const seatNumbersToDelete = cancelledTickets.map((t) => t.seatNumber);

  if (seatNumbersToDelete.length > 0) {
    await Ticket.destroy({
      where: {
        ticketState: "cancelled",
        cancelledAt: {
          [Op.lte]: expiredTime,
        },
      },
    });

    await Seat.destroy({
      where: {
        seatNumber: { [Op.in]: seatNumbersToDelete },
      },
    });
  }
});
