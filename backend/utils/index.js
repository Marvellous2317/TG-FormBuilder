import axios from "axios";
import config from "../appConfig.js";
import { ApplicationError } from "./errorHandler.js";

const GOOGLE_API_KEY = config.GOOGLE_MAP_API_KEY;


export async function getStateAndLGA(lat, lng) {
  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_API_KEY,
      },
    });

    const results = response.data.results;
    if (!results || results.length === 0) throw new ApplicationError("No results found for the given coordinates.", 404);
    

    let state = "";
    let lga = "";
    const address = results[0].formatted_address;

    for (const component of results[0].address_components) {
      if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
      if (component.types.includes("administrative_area_level_2")) {
        lga = component.long_name;
      }
    }

    return { state, lga, address };
  } catch (error) {
    console.error("Error fetching location:", error.message);

    if (axios.isAxiosError(error)) {
      throw new ApplicationError(
        error.response?.data?.error_message || "Failed to fetch location from Google API",
        error.response?.status || 400
      );
    }
    throw new ApplicationError("Failed to get location data.", 400);
  }
}




