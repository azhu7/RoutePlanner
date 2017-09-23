var markers = [];

function initMap() {
	var myLatlng = {lat: -25.363, lng: 131.044};

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: myLatlng
	});

	map.addListener('center_changed', function() {
		var marker = new google.maps.Marker({
			position 
		});
	});

	google.maps.event.addListener(map, 'click', function(event) {
		placeMarker(event.latLng);
	});

	function placeAndAddMarker(location) {
		var marker = new google.maps.Marker({
			position: location, 
			map: map
		});
	}
}

