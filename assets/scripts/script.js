
let searchBtn = $("#search-btn");

const getCity = () => {
    return $("#search-input").val()
}

let getCoodinates = async (city) => {
    let coordinates = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${city}&apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
        .then(response => {
            return response.json()
        })
        .then(response => {
            if (response.status === "NOT_FOUND") {
                // display a message letting the user know that the city cannot be found
                // return;
            }
            else {
                console.log(response)
                getPlacesXID({
                    lat: response.lat,
                    lon: response.lon
                });
            }
            // return coordinates;
        
        })
}

const getPlacesXID = (coordinates) => {
    // define the categories of places you want in the result
    let placesCategories = "other,natural,sport,industrial_facilities,historical_places,archaeology,cultural,architecture,amusements";
    
    fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=16093.4&lon=${coordinates.lon}&lat=${coordinates.lat}&rate=3&kinds=${placesCategories}&limit=5&apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
        .then(response => {
        return response.json()
        }).then(response => {
            console.log(response)
            if (response) {
                getPlaceInfo(response.features)
            }
        return response
    })
}

function getPlaceInfo(xIDs) {
    const promises = xIDs.map((xIDs) => {
        return fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xIDs.properties.xid}?apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
    })
    Promise.all(promises)
        .then(values => {
            return Promise.all(values.map(function (value) {
                return value.json();
            }))
        })
        .then(function (response) {
            console.log(response)
            displayCarousel(response);
        });
}// fetch images and place description
function displayCarousel(response) {
    $("#result-grid").empty();
    response.map((response, index)=> {
        let imgSrc = response.preview.source;
        let pxIndex = imgSrc.lastIndexOf("px");
        let newImgSrc = imgSrc.replace(`${imgSrc[pxIndex - 3]}${imgSrc[pxIndex - 2]}${imgSrc[pxIndex - 1]}`, "999");
        var carouselItem = $(`<div class="carousel-item text-center"><img src=${newImgSrc}  class="mx-auto d-block" alt=...><div class="carousel-caption d-none d-md-block"><h2>${response.name}</h2><p>${response.wikipedia_extracts.text}</p></div></div>`)
        $("#result-grid").append(carouselItem);
        $(".landing").css("height", "-=50")
        // if (index === 0) {
        //     $(".carousel-item").addClass("active");
        // }
    });
    // fetchAirports();
    // weatherFetch();
}// display carousel

$("#search-btn").on("click", (event)=>{
    event.preventDefault();
    let city = getCity();
    if (city.length) {
        console.log(city)
        getCoodinates(city)
        
    }
})