/**
utility.js
Contains shared functionalities.
*/

module.exports = {
	// Destination object
	dest: function(lat, lng, address) {
	    this.lat = lat;			 // decimal
	    this.lng = lng;			 // decimal
	    this.address = address;  // string
	}
}