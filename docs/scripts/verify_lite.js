const generateSlug = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

class DataTransformationService {
  addDynamicSpecs(data, specs, knownKeys) {
    Object.keys(data).forEach((key) => {
      if (knownKeys.has(key)) return;
      const value = data[key];
      if (value === null || value === undefined || value === "") return;
      if (key === "id" || key === "slug" || key === "_id") return;
      let category = "General";
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("camera")) category = "Camera";
      else if (lowerKey.includes("display")) category = "Display";
      else if (lowerKey.includes("battery")) category = "Battery";
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      specs.push({ category, key: formattedKey, value: String(value) });
    });
  }

  transformNewSecondaryDevice(data, brand, model) {
    const specs = [];
    const knownKeys = new Set();
    const addSpec = (category, key, value, originalKey) => {
      if (value && value !== " ") {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    if (data.spotlight) {
      const s = data.spotlight;
      addSpec("Display", "Size", s.display_size, "display_size");
      addSpec(
        "Display",
        "Resolution",
        s.display_resolution,
        "display_resolution",
      );
      addSpec("Platform", "Chipset", s.chipset, "chipset");
      addSpec("Battery", "Size", s.battery_size, "battery_size");
      addSpec("Platform", "OS", s.os, "os");
    }

    if (data.all_specs) {
      Object.keys(data.all_specs).forEach((category) => {
        const catArray = data.all_specs[category];
        if (Array.isArray(catArray)) {
          catArray.forEach((item) => {
            if (item.title && item.title.trim() && item.info) {
              specs.push({ category, key: item.title, value: item.info });
            }
          });
        }
      });
      knownKeys.add("all_specs");
    }

    knownKeys.add("spotlight");
    knownKeys.add("phoneName");
    knownKeys.add("brandName");

    return {
      name: data.phoneName || `${brand} ${model}`,
      specs: specs,
    };
  }
}

const transformer = new DataTransformationService();
const exampleResponse = {
  spotlight: {
    os: "iOS 12",
    chipset: "Apple A12 Bionic",
    display_size: '6.5"',
  },
  all_specs: {
    Network: [{ title: "Technology", info: "LTE" }],
  },
  phoneName: "iPhone XS Max",
  brandName: "Apple",
};

const result = transformer.transformNewSecondaryDevice(
  exampleResponse,
  "Apple",
  "iPhone XS Max",
);
console.log("Verified Mapping Results:");
console.log("Device Name:", result.name);
console.log("Specs count:", result.specs.length);
console.log("Chipset:", result.specs.find((s) => s.key === "Chipset")?.value);
console.log(
  "Network:",
  result.specs.find((s) => s.key === "Technology")?.value,
);

if (
  result.name === "iPhone XS Max" &&
  result.specs.some((s) => s.value === "Apple A12 Bionic")
) {
  console.log("\n✅ SUCCESS: STANDALONE VERIFICATION PASSED");
} else {
  console.log("\n❌ FAILURE: STANDALONE VERIFICATION FAILED");
  process.exit(1);
}
