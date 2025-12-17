import { StyleSheet } from 'react-native';

export const modalButtonText = 'pink';
export const modalDateButtonText = 'orange';
export const fabButtonText = 'orange';
export const navButtonText = 'pink';

const styles = StyleSheet.create({

// ------------------ Universal ------------------
    pageTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },

    emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: { 
    fontSize: 25, 
    color: 'black', 
    textAlign: 'center' },
  
  internalBack: { 
    marginBottom: 10,
    color: 'pink', 
    backgroundColor: 'green'},

  pageSubtitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center', 
    color: 'green'
  },

  // ------------------ Modal ------------------

  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,},
  /*modalTextInput: { 
    marginBottom: 12,
    backgroundColor: 'pink', 
    color: 'green', 
    },*/
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12 },
  modalButton: { 
    backgroundColor: 'green', 
    borderRadius: 10, 
    marginVertical: 10, 
    marginTop: 10, },
  modalHeading: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 },
  modalNotes: { 
    marginBottom: 10, 
    height: 80 },
  dateButton: { 
    marginVertical: 8, 
    backgroundColor: '#263041', 
    borderRadius: 10, 
},

  // ------------------ Home ------------------
  button: { 
    backgroundColor: '#263041', 
    borderRadius: 10, 
    marginVertical: 10, 
    marginTop: 10, 
    color: 'white' },
  
  flex: { flex: 1 },
  navButton: {
    marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: '#263041',
  },
  
  
  noTripsContainer: { marginTop: 40, alignItems: 'center' },
  noTripsText: { fontSize: 18, opacity: 0.7 },
  navButtonContainer: { marginTop: 20 },
  

    // ------------------ Budget ------------------
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  scrollArea: { flex: 1 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },


  backgroundImage: { flex: 1 },
  errorText: { color: 'red' },


  // ------------------ Hotels ------------------
  
  input: { marginBottom: 10 },
  submitButton: { marginVertical: 10 },
  keyboardAvoiding: { flex: 1 },

  // ------------------ Itinerary ------------------
  calendar: { borderRadius: 10, elevation: 2 },




  // ------------------ Packing ------------------
  activeListHeader: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemText: { flex: 1, fontSize: 16 },
  error: { color: 'red', marginTop: 4 },
  keyboardContainer: { flex: 1 },
  divider: { marginVertical: 10 },
  activeListContainer: { flex: 1 },


});

export default styles;



