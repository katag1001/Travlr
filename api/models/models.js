const mongoose = require('mongoose');

/* 
1. When a Trip is added:
- Itinerary items are automatically added between the startDate and EndDate, passing the Trip ID and username and null values for day and night
- Two new Budget items are automatically added with the budgetName "Accommodation" and "Flights", passing the Trip ID and username and null values for spent and total
2. When a Trip is deleted, all items associated with the trip ID in other schemas are deleted

3. When a Hotel is added: 
- A Spend item is added passing trip -> trip, username -> username,  budget -> the Budget ID for "Accomodation", spendName -> hotelName, date -> date, spend -> cost
- The Itinerary items for the the dates between startDate until 1 day before endDate are updated - night will read `Staying at ${hotelName} in ${hotelPlace}`
4. When a hotel is deleted, the matching Spend and Itinerary items are deleted 
5. When a hotel is updated, the matching Spend and Itinerary items are updated

6. When a Spend is added, the associated Budget spent value is updated by adding the new spend value
7. When a Spend is deleted, the associated Budget spent value is updated by subtracting the new spend value
8. When a Spend is, the associated Budget spent value is updated by subtracting old spend value and adding the new spend value
*/


/* USERS - controllers created */
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
},
{strictQuery: false}
)

/* TRIP - all CRUD controllers
 - create triggers the creation of itinerary entries between the start and end date*/ 
const tripSchema = new mongoose.Schema({
  tripName: { type: String, required: true},
  username: { type: String, required: true, default: "guest" },
  startDate: { type: Date, required: true  },
  endDate: { type: Date, required: true  },
});

/* PACKING - all CRUD controllers */
const packingSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  username: { type: String, required: true, default: "guest" },
  type: { type: String, default: null },
  item: { type: String, default: null },
});

/* ITINERARY only RUD controllers and createMany controller that will be fed from create Trip  */ 
const itinerarySchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  username: { type: String, required: true, default: "guest" },
  date: { type: Date, required: true},
  day: { type: String, required: false},
  night: { type: String, required: false},
});

/* HOTELS - all CRUD controllers */ 
const hotelSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  username: { type: String, required: true, default: "guest" },
  startDate: { type: Date, required: true},
  endDate: { type: Date, required: true},
  hotelName: { type: String, required: false}, 
  hotelPlace: { type: String, required: false}, 
  cost: { type: Number, required: false}, 
});

/* BUDGET - all CRUD controllers */ 
const budgetSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  username: { type: String, required: true, default: "guest" },
  budgetName: { type: String, required: false },
  spent: { type: Number, required: false },
  total: { type: Number, required: false },
});

/* SPEND - all CRUD controllers */ 
const spendSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  username: { type: String, required: true, default: "guest" },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
  spendName: { type: String, required: false},
  date: { type: Date, required: true},
  spend: { type: Number, required: false},
});


module.exports = {
  User: mongoose.model('User', userSchema),
  Trip: mongoose.model('Trip', tripSchema),
  Packing: mongoose.model('Packing', packingSchema),
  Itinerary: mongoose.model('Itinerary', itinerarySchema),
  Hotel: mongoose.model('Hotel', hotelSchema),
  Budget: mongoose.model('Budget', budgetSchema),
  Spend: mongoose.model('Spend', spendSchema),
};