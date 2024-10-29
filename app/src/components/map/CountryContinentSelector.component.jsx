import React, { useState } from "react";
import { Box, Input, Button } from "@chakra-ui/react";
import countriesData from "./data/countries.json"; // Importing countries JSON data
// import { SearchIcon } from "@chakra-ui/icons";
import { HiSearch } from "react-icons/hi";

export default function CountryContinentSelector({ onSelect }) {
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("");

  // Handling continent selection
  const handleContinentSelect = (event) => {
    const value = event.target.value;
    setSelectedContinent(value);

    let newViewState;
    switch (value) {
      case "Europe":
        newViewState = {
          longitude: 10.4515,
          latitude: 51.1657,
          zoom: 3,
        };
        break;
      case "Asia":
        newViewState = {
          longitude: 100.6197,
          latitude: 34.0479,
          zoom: 2,
        };
        break;
      case "Africa":
        newViewState = { longitude: 20.0, latitude: 10.0, zoom: 2 };
        break;
      case "North America":
        newViewState = { longitude: -100.0, latitude: 40.0, zoom: 2 };
        break;
      case "South America":
        newViewState = { longitude: -60.0, latitude: -15.0, zoom: 2 };
        break;
      case "Australia":
        newViewState = {
          longitude: 133.7751,
          latitude: -25.2744,
          zoom: 3,
        };
        break;
      default:
        newViewState = {
          longitude: 15.4395,
          latitude: 47.0707,
          zoom: 8,
        };
    }
    onSelect(newViewState);
  };

  // Handling country search input change
  const handleCountryInputChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);

    if (value.length > 0 && selectedContinent) {
      const filtered = countriesData.filter(
        (country) =>
          country.name.common.toLowerCase().startsWith(value.toLowerCase()) &&
          country.region === selectedContinent
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries([]);
    }
  };

  // Handling country selection from the button
  const handleCountrySelect = () => {
    const selectedCountry = filteredCountries.find(
      (country) =>
        country.name.common.toLowerCase() === searchValue.toLowerCase()
    );
    if (selectedCountry && selectedCountry.latlng) {
      const [latitude, longitude] = selectedCountry.latlng;
      const newViewState = { longitude, latitude, zoom: 5 };
      onSelect(newViewState);
    }
  };

  return (
    <Box
      position="absolute"
      bottom={"0.5em"}
      left="0.5em"
      bg="blackAlpha.800"
      p={2}
      borderRadius="md"
      boxShadow="lg"
      zIndex="1000"
      border="1px solid purple"
      color="purple.800"
      display={"flex"}
      gap={2}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Input
        placeholder="Continent"
        as="select"
        onChange={handleContinentSelect}
        color="purple.600"
        borderColor="purple.500"
        focusBorderColor="purple.700"
        size={{ base: "sm", md: "md" }}
        borderRadius={"lg"}
        _hover={{ borderColor: "purple.200" }}
      >
        <option value="Europe">Europe</option>
        <option value="Asia">Asia</option>
        <option value="Africa">Africa</option>
        <option value="North America">North America</option>
        <option value="South America">South America</option>
        <option value="Australia">Australia</option>
      </Input>

      <Input
        placeholder="country name"
        textTransform={"capitalize"}
        value={searchValue}
        onChange={handleCountryInputChange}
        color="purple.600"
        borderColor="purple.500"
        focusBorderColor="purple.700"
        list="country-suggestions"
        display={"flex"}
        alignItems={"center"}
        size={{ base: "sm", md: "md" }}
        borderRadius={"lg"}
        _hover={{ borderColor: "purple.200" }}
      />

      <datalist id="country-suggestions">
        {filteredCountries.map((country) => (
          <option key={country.cca3} value={country.name.common} />
        ))}
      </datalist>

      <Button
        onClick={handleCountrySelect}
        colorScheme="purple"
        variant="solid"
        size={{ base: "sm", md: "md" }}
      >
        <HiSearch
          style={{
            color: "purple",
            fontSize: "3em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Button>
    </Box>
  );
}
