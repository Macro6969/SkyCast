function getCityByCoordinates() {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        // Using OpenStreetMap's free/open reverse geocoding API (Nominatim)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();
        const addr = data.address;
        console.log(addr);

        // Extract city from the address object (handles variations in API responses)
        const cities = [
          addr.city,
          addr.town,
          addr.village,
          addr.district,
          addr.city_district,
          addr.state_district,
        ].filter(Boolean);

        console.log(`Cities hierarchy:`, cities);

        // Fetch weather using the first available match
        fetch(
          `https://api.weatherapi.com/v1/current.json?key=218e7ec8f0e5474984d112126262206&q=${encodeURIComponent(cities[0])}`,
        )
          .then(async (response) => {
            const resBody = await response.json();

            // If the server returns an error code (like 400)
            if (!response.ok) {
              const httpStatus = response.status;
              const apiErrorCode = resBody.error.code;
              const apiErrorMessage = resBody.error.message;

              console.error(
                `HTTP Status: ${httpStatus}, API Error Code: ${apiErrorCode}, Message: ${apiErrorMessage}`,
              );
              throw {
                status: httpStatus,
                code: apiErrorCode,
                message: apiErrorMessage,
              };
            }

            // FIXED: If response is OK, pass the parsed data down to the next .then()
            return resBody;
          })
          .then((data) => {
            weatherdata(data);
          })
          .catch((error) => {
            if (error.code) {
              const textElements = document.querySelectorAll(
                "#location, #temperature, #description",
              );
              textElements.forEach((el) => {
                el.innerText = "NaN";
              });
              alert(
                `Weather API Error: ${error.message} (Code: ${error.code})`,
              );
            }
          }); // <-- FIXED: Added missing closing } here
      } catch (error) {
        // FIXED: Safely handle errors without assuming a deep nested structure
        console.error(
          "Error processing location or weather data:",
          error.message || error,
        );
      }
    },
    (error) => {
      console.error("User denied location access or error occurred:", error);
    },
  );
}

const images = {
  sunny:
    "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=1600",
  cloudy:
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1600",
  rain: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1600",
  snow: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1600",
  thunder:
    "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1600",
  mist: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600",
  default:
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1600",
};

function searchWeatherByCity() {
  const inputCity = document.querySelector("#city-input").value;
  console.log(inputCity);
  const searchbtn = document.querySelector("#search-btn");

  try {
    fetch(
      `https://api.weatherapi.com/v1/current.json?key=218e7ec8f0e5474984d112126262206&q=${encodeURIComponent(inputCity)}`,
    )
      .then(async (response) => {
        const res = await response.json();
        if (!response.ok) {
          const httpStatus = response.status;
          const apiErrorCode = res.error.code;
          const apiErrorMessage = res.error.message;

          console.error(
            `HTTP Status: ${httpStatus}, API Error Code: ${apiErrorCode}, Message: ${apiErrorMessage}`,
          );
          throw {
            status: httpStatus,
            code: apiErrorCode,
            message: apiErrorMessage,
          };
        }
        return res;
      })
      .then((data) => {
        weatherdata(data);
      });
  } catch (error) {}
}
function weatherdata(data) {
  const icon = document.querySelector("#weather-icon");
  const temp = document.querySelector("#temperature");
  const city = document.querySelector("#location");
  const description = document.querySelector("#description");
  temp.innerText = data.current.temp_c + "°C";
  const condition = data.current.condition.text.toLowerCase();
  console.log("Weather condition:", condition);
  const body = document.querySelector("#bgimg");
  const humidity = document.querySelector("#humidity p");
  const precipitation = document.querySelector("#precipitation p");
  const windSpeed = document.querySelector("#Wind-Speed p");
  const uvIndex = document.querySelector("#uv p");
  humidity.innerText = data.current.humidity + "%";
  precipitation.innerText = data.current.precip_mm + " mm";
  windSpeed.innerText = data.current.wind_mph + " mph";
  uvIndex.innerText = data.current.uv;
  description.innerText = data.current.condition.text;
  city.innerText = data.location.name + ", " + data.location.country;
  let selectedImage = images.default;
  if (condition.includes("sun") || condition.includes("clear")) {
    selectedImage = images.sunny;
    icon.src = "./Images/sun.png";
  } else if (condition.includes("thunder")) {
    selectedImage = images.thunder;
    icon.src = "./Images/lightning.png";
  } else if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("showers")
  ) {
    selectedImage = images.rain;
    icon.src = "./Images/rain.png";
  } else if (
    condition.includes("snow") ||
    condition.includes("ice") ||
    condition.includes("sleet")
  ) {
    selectedImage = images.snow;
    icon.src = "./Images/snow.png";
  } else if (condition.includes("cloud") || condition.includes("overcast")) {
    selectedImage = images.cloudy;
    icon.src = "./Images/cloud1.png";
  } else if (
    condition.includes("mist") ||
    condition.includes("fog") ||
    condition.includes("haze")
  ) {
    selectedImage = images.mist;
    icon.src = "./Images/mist.png";
  }
  // 3. Apply styles cleanly to make the image fit beautifully full-screen
  body.src = selectedImage;
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundAttachment = "fixed";
}

// Call the function
getCityByCoordinates();
srchbutton = document
  .querySelector("#search-btn")
  .addEventListener("click", searchWeatherByCity);
let srchfield = document
  .querySelector("#city-input")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchWeatherByCity();
    }
  });
