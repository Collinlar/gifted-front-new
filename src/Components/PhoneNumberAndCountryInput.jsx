import { useEffect, useState } from "react";
import Select, { components } from "react-select";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Custom option to include flags
const Option = (props) => {
  return (
    <components.Option {...props}>
      <span className="mr-2">{props.data.flag}</span>
      {props.data.label}
    </components.Option>
  );
};

export default function CountryPhoneInput({ name, control, setValue, watch }) {
  const [countries, setCountries] = useState([]);
  const selectedCountry = watch(`${name}.country`);
  const phoneValue = watch(`${name}.phone`) || "";

  // Fetch countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then(res => res.json())
      .then(data => {
        const formatted = data
          .filter(c => c.idd?.root)
          .map(c => ({
            label: c.name.common,
            value: c.cca2,
            callingCode: `${c.idd.root}${c.idd.suffixes?.[0] || ""}`,
            flag: c.flags?.emoji || "🏳️",
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(formatted);
      });
  }, []);

  // When country changes → prefix phone
  const handleCountryChange = (country) => {
    setValue(`${name}.country`, country);
    setValue(`${name}.phone`, country.callingCode);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setValue(`${name}.phone`, value);
  };

  // Optional: validate phone
  const isValidPhone =
    selectedCountry &&
    parsePhoneNumberFromString(phoneValue, selectedCountry.value)?.isValid();

  return (
    <div className="space-y-2">
      <Select
        options={countries}
        value={selectedCountry}
        onChange={handleCountryChange}
        placeholder="Select country"
        isSearchable
        components={{ Option }}
        className="w-full"
      />

      <input
        type="tel"
        value={phoneValue}
        onChange={handlePhoneChange}
        placeholder="Phone number"
        className={`w-full border px-3 py-2 rounded ${
          phoneValue && !isValidPhone ? "border-red-500" : "border-gray-300"
        }`}
        disabled={!selectedCountry}
      />

      {phoneValue && !isValidPhone && (
        <p className="text-red-500 text-sm">Invalid phone number</p>
      )}
    </div>
  );
}
