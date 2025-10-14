const bcrypt = require("bcryptjs"); // https://github.com/dcodeIO/bcrypt.js#readme
const jwt = require("jsonwebtoken");
const validator = require("validator");
const jwt_secret = process.env.JWT_SECRET;

const { User, Trip, Packing, Budget, Spend, Itinerary, Hotel } = require('../models/models.js');

// USER CONTROLLERS ---------------------------------------------------------------------------

exports.createItemregister = async (req, res) => {
  const { email, password, password2 } = req.body;
  if (!email || !password || !password2) {
    return res.json({ ok: false, message: "All fields required" });
  }
  if (password !== password2) {
    return res.json({ ok: false, message: "Passwords must match" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email" });
  }
  try {
    const user = await User.findOne({ email });
    if (user) return res.json({ ok: false, message: "User exists!" });

    // Generate a salt
    const salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    const hash = bcrypt.hashSync(password, salt);

    const newUser = {
      email,
      password: hash,
    };
    await User.create(newUser);
    res.json({ ok: true, message: "Successfully registered" });
  } catch (error) {
    console.log(error);
    res.json({ ok: false, error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ ok: false, message: "All fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email provided" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, message: "Invalid user provided" });

    const match = bcrypt.compareSync(password, user.password);
    if (match) {
      const token = jwt.sign({ userEmail: user.email }, jwt_secret, {
        expiresIn: "356d",
      });
      res.json({ ok: true, message: "welcome back", token, email });
    } else return res.json({ ok: false, message: "Invalid data provided" });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

exports.verify_token = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ ok: false, message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, jwt_secret, (err, succ) => {
    if (err) {
      return res.json({ ok: false, message: "Token is corrupted" });
    }
    res.json({ ok: true, succ });
  });
};


// TRIP CONTROLLERS -----------------------------------------------------------------------------

exports.createTrip = async (req, res) => {
  const { tripName, username = "guest", startDate, endDate } = req.body;
  try {
    const trip = await Trip.create({ tripName, username, startDate, endDate });

    // Create Itinerary items for each date
    const itineraryItems = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      itineraryItems.push({
        trip: trip._id,
        username,
        date: new Date(current),
        day: null,
        night: null,
      });
      current.setDate(current.getDate() + 1);
    }
    await Itinerary.insertMany(itineraryItems);

    // Create Budgets
    const budgets = [
      { trip: trip._id, username, budgetName: "Accommodation", spent: 0, total: null },
      { trip: trip._id, username, budgetName: "Flights", spent: 0, total: null },
    ];
    await Budget.insertMany(budgets);

    res.json({ ok: true, trip });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  const { tripId } = req.params;
  try {
    await Trip.findByIdAndDelete(tripId);
    await Packing.deleteMany({ trip: tripId });
    await Itinerary.deleteMany({ trip: tripId });
    await Hotel.deleteMany({ trip: tripId });
    const budgets = await Budget.find({ trip: tripId });

    const budgetIds = budgets.map(b => b._id);
    await Spend.deleteMany({ budget: { $in: budgetIds } });
    await Budget.deleteMany({ trip: tripId });

    res.json({ ok: true, message: "Trip and related data deleted" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllTrips = async (req, res) => {
  const { username } = req.query;
  try {
    const query = username ? { username } : {};
    const trips = await Trip.find(query);
    res.json({ ok: true, trips });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOneTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    res.json({ ok: true, trip });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// PACKING CONTROLLERS -------------------------------------------------------------------------

exports.createPacking = async (req, res) => {
  try {
    const packing = await Packing.create(req.body);
    res.json({ ok: true, packing });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.updatePacking = async (req, res) => {
  try {
    const packing = await Packing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, packing });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.deletePacking = async (req, res) => {
  try {
    await Packing.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllPackingItems = async (req, res) => {
  const { trip, username } = req.query;
  try {
    const query = {};
    if (trip) query.trip = trip;
    if (username) query.username = username;

    const items = await Packing.find(query);
    res.json({ ok: true, items });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOnePackingItem = async (req, res) => {
  try {
    const item = await Packing.findById(req.params.id);
    res.json({ ok: true, item });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};


// ITINERARY CONTROLLERS ----------------------------------------------------------------------

exports.updateItinerary = async (req, res) => {
  try {
    const item = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, item });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.createManyItineraries = async (req, res) => {
  try {
    await Itinerary.insertMany(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllItineraryItems = async (req, res) => {
  const { trip, username } = req.query;
  try {
    const query = {};
    if (trip) query.trip = trip;
    if (username) query.username = username;

    const items = await Itinerary.find(query).sort({ date: 1 });
    res.json({ ok: true, items });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOneItineraryItem = async (req, res) => {
  try {
    const item = await Itinerary.findById(req.params.id);
    res.json({ ok: true, item });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};


// HOTEL CONTROLLERS -----------------------------------------------------------------------------

exports.createHotel = async (req, res) => {
  const { trip, username, hotelName, hotelPlace, cost, startDate, endDate } = req.body;
  try {
    const hotel = await Hotel.create(req.body);

    if (cost) {
      const budget = await getBudgetByName({ tripId: trip, username, budgetName: "Accommodation" });
      await Spend.create({
        trip,
        username,
        budget: budget._id,
        spendName: hotelName,
        date: new Date(startDate),
        spend: cost,
      });
    }

    await setItineraryNights({
      tripId: trip,
      username,
      startDate,
      endDate,
      text: `Staying at ${hotelName} in ${hotelPlace}`,
    });

    res.json({ ok: true, hotel });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  const hotelId = req.params.id;
  try {
    const existing = await Hotel.findById(hotelId);
    const updated = await Hotel.findByIdAndUpdate(hotelId, req.body, { new: true });

    // Clear old itinerary nights
    await clearItineraryNights({
      tripId: updated.trip,
      username: updated.username,
      startDate: existing.startDate,
      endDate: existing.endDate,
    });

    // Set new itinerary nights
    await setItineraryNights({
      tripId: updated.trip,
      username: updated.username,
      startDate: updated.startDate,
      endDate: updated.endDate,
      text: `Staying at ${updated.hotelName} in ${updated.hotelPlace}`,
    });

    const budget = await getBudgetByName({
      tripId: updated.trip,
      username: updated.username,
      budgetName: "Accommodation",
    });

    const spend = await Spend.findOne({
      trip: updated.trip,
      username: updated.username,
      budget: budget._id,
      spendName: existing.hotelName,
    });

    if (spend) {
      // Update Spend
      spend.spendName = updated.hotelName;
      spend.date = updated.startDate;
      spend.spend = updated.cost;
      await spend.save();
    } else if (updated.cost) {
      // Create Spend if it didn't exist
      await Spend.create({
        trip: updated.trip,
        username: updated.username,
        budget: budget._id,
        spendName: updated.hotelName,
        date: updated.startDate,
        spend: updated.cost,
      });
    }

    res.json({ ok: true, hotel: updated });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.json({ ok: false, message: "Hotel not found" });

  try {
    const budget = await getBudgetByName({
      tripId: hotel.trip,
      username: hotel.username,
      budgetName: "Accommodation",
    });

    await Spend.deleteOne({
      trip: hotel.trip,
      username: hotel.username,
      budget: budget._id,
      spendName: hotel.hotelName,
    });

    await clearItineraryNights({
      tripId: hotel.trip,
      username: hotel.username,
      startDate: hotel.startDate,
      endDate: hotel.endDate,
    });

    await hotel.remove();
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllHotels = async (req, res) => {
  const { trip, username } = req.query;
  try {
    const query = {};
    if (trip) query.trip = trip;
    if (username) query.username = username;

    const hotels = await Hotel.find(query);
    res.json({ ok: true, hotels });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOneHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.json({ ok: true, hotel });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};


// BUDGET CONTROLLERS ---------------------------------------------------------------------------

exports.createBudget = async (req, res) => {
  try {
    const budget = await Budget.create(req.body);
    res.json({ ok: true, budget });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, budget });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllBudgets = async (req, res) => {
  const { trip, username } = req.query;
  try {
    const query = {};
    if (trip) query.trip = trip;
    if (username) query.username = username;

    const budgets = await Budget.find(query);
    res.json({ ok: true, budgets });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOneBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    res.json({ ok: true, budget });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// SPEND CONTROLLERS ----------------------------------------------------------------------------

exports.createSpend = async (req, res) => {
  try {
    const spend = await Spend.create(req.body);
    await Budget.findByIdAndUpdate(req.body.budget, { $inc: { spent: spend.spend || 0 } });
    res.json({ ok: true, spend });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.updateSpend = async (req, res) => {
  try {
    const oldSpend = await Spend.findById(req.params.id);
    const updated = await Spend.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const diff = (updated.spend || 0) - (oldSpend.spend || 0);
    await Budget.findByIdAndUpdate(updated.budget, { $inc: { spent: diff } });

    res.json({ ok: true, spend: updated });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.deleteSpend = async (req, res) => {
  try {
    const spend = await Spend.findByIdAndDelete(req.params.id);
    if (spend) {
      await Budget.findByIdAndUpdate(spend.budget, { $inc: { spent: -spend.spend } });
    }
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getAllSpends = async (req, res) => {
  const { trip, username, budget } = req.query;
  try {
    const query = {};
    if (trip) query.trip = trip;
    if (username) query.username = username;
    if (budget) query.budget = budget;

    const spends = await Spend.find(query);
    res.json({ ok: true, spends });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

exports.getOneSpend = async (req, res) => {
  try {
    const spend = await Spend.findById(req.params.id);
    res.json({ ok: true, spend });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
};

// ----------------------------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------------------------
async function getBudgetByName({ tripId, username, budgetName }) {
  return await Budget.findOne({ trip: tripId, username, budgetName });
}

function getDateRange(startDate, endDate) {
  const range = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current < end) {
    range.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

async function setItineraryNights({ tripId, username, startDate, endDate, text }) {
  const dates = getDateRange(startDate, endDate);
  return await Itinerary.updateMany(
    { trip: tripId, username, date: { $in: dates } },
    { $set: { night: text } }
  );
}

async function clearItineraryNights({ tripId, username, startDate, endDate }) {
  const dates = getDateRange(startDate, endDate);
  return await Itinerary.updateMany(
    { trip: tripId, username, date: { $in: dates } },
    { $unset: { night: "" } }
  );
}





