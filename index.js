/*Initializing and adding the map*/
function initMap(){
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0},
        zoom: 3,
    });

    const input = document.getElementById("search-box");
    const autocomplete = new google.maps.places.Autocomplete(input);

    /*Info window with location details*/
    const infoWindow = new google.maps.InfoWindow();
    const marker = new google.maps.Marker({
        map: map,
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            console.log("Place contains no geometry");
            return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(10);
        marker.setPosition(place.geometry.location);

        /*Fetching and displaying landmarks*/
        findNearbyLandmarks(place.geometry.location, infoWindow, marker, place.name);
    });

    map.addListener('click', (event) => {
        marker.setPosition(event.latLng);
        map.setCenter(event.latLng);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: event.latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
                infoWindow.setContent('<div><strong>' + results[0].formatted_address + '</strong><br>' +
                    'Lat: ' + event.latLng.lat() + ', Lng: ' + event.latLng.lng() + '</div>');
                infoWindow.open(map, marker);

                findNearbyLandmarks(event.latLng, infoWindow, marker, results[0].formatted_address);
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    });
    /* Clear button functionality
         document.getElementById("clear-button").onclick = function() {
        input.value = ''; 
        marker.setMap(null); 
        infoWindow.close(); 
        map.setCenter({ lat: 0, lng: 0 });
        map.setZoom(3);
    }; */
}

function findNearbyLandmarks(location, infoWindow, marker, placeName) {
    const service = new google.maps.places.PlacesService(marker.getMap());

    const request = {
        location: location,
        radius: '4000',
        type: ['tourist_attraction'],
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            let landmarkContent = '<h4>Nearby Landmarks</h4><ul>';
            results.forEach(place => {
                landmarkContent += `<li><strong>${place.name}</strong> - Rating: ${place.rating || 'N/A'}</li>`;
            });
            landmarkContent += '</ul>';
            
            /*displaying content in the info window*/
            infoWindow.setContent('<div><strong>' + placeName + '</strong><br>' +
                'Location: ' + location.lat() + ', ' + location.lng() + '</div>' + landmarkContent);
            infoWindow.open(marker.getMap(), marker);
        } else {
            infoWindow.setContent('<div><strong>' + placeName + '</strong><br>' +
                'Location: ' + location.lat() + ', ' + location.lng() + '</div>' +
                '<h4>No nearby landmarks found.</h4>');
            infoWindow.open(marker.getMap(), marker);
        }
    });
}