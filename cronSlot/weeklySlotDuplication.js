const cron = require('node-cron');
const Slot = require('../models/slotModel');

function getNextWeekDate(dayOfWeek) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayDay = today.getDay();
  const daysUntilNextOccurrence = (daysOfWeek.indexOf(dayOfWeek) - todayDay + 7) % 7 || 7;

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntilNextOccurrence);
  return nextDate;
}

// Schedule a cron job to run every Sunday at midnight
cron.schedule('0 0 * * 0', async () => {
  try {
    const slots = await Slot.find({ isDeleted: false });

    for (const slot of slots) {
      const nextDate = getNextWeekDate(slot.dayOfWeek);

      const newSlot = new Slot({
        doctor: slot.doctor,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
        Date: nextDate,
      });

      await newSlot.save();
    }

    console.log('Weekly slots duplicated successfully.');
  } catch (error) {
    console.error('Error duplicating slots:', error);
  }
});
