const express = require('express');
const router = express.Router();
const allControllers = require('../controllers/controllers'); 

// USER ROUTES -----------------------------------------------------------------------------------
router.post('/users/register', allControllers.createItemregister);
router.post('/users/login', allControllers.login);
router.post('/users/verify_token', allControllers.verify_token);


// TRIP ROUTES -----------------------------------------------------------------------------------
router.post('/trips/', allControllers.createTrip);
router.get('/trips/', allControllers.getAllTrips); // ?username=
router.get('/trips/:id', allControllers.getOneTrip);
router.delete('/trips/:tripId', allControllers.deleteTrip);


// PACKING ROUTES ---------------------------------------------------------------------------------
router.post('/packing/', allControllers.createPacking);
router.get('/packing/', allControllers.getAllPackingItems); // ?trip=&username=
router.get('/packing/:id', allControllers.getOnePackingItem);
router.put('/packing/:id', allControllers.updatePacking);
router.delete('/packing/:id', allControllers.deletePacking);


// ITINERARY ROUTES ---------------------------------------------------------------------------------
router.get('/itinerary/', allControllers.getAllItineraryItems); 
router.get('/itinerary/:id', allControllers.getOneItineraryItem);
router.put('/itinerary/:id', allControllers.updateItinerary);
router.delete('/itinerary/:id', allControllers.deleteItinerary);
router.post('/itinerary/bulk', allControllers.createManyItineraries);


// HOTEL ROUTES -----------------------------------------------------------------------------------
router.post('/hotels/', allControllers.createHotel);
router.get('/hotels/', allControllers.getAllHotels);
router.get('/hotels/:id', allControllers.getOneHotel);
router.put('/hotels/:id', allControllers.updateHotel);
router.delete('/hotels/:id', allControllers.deleteHotel);


// BUDGET ROUTES -----------------------------------------------------------------------------------
router.post('/budgets/', allControllers.createBudget);
router.get('/budgets/', allControllers.getAllBudgets);
router.get('/budgets/:id', allControllers.getOneBudget);
router.put('/budgets/:id', allControllers.updateBudget);
router.delete('/budgets/:id', allControllers.deleteBudget);


// SPEND ROUTES -----------------------------------------------------------------------------------
router.post('/spends/', allControllers.createSpend);
router.get('/spends/', allControllers.getAllSpends);
router.get('/spends/:id', allControllers.getOneSpend);
router.put('/spends/:id', allControllers.updateSpend);
router.delete('/spends/:id', allControllers.deleteSpend);



module.exports = router;
