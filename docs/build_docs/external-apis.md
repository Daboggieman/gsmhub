# External API Reference

This document covers the external RapidAPI services used by GSHub to fetch device data.

## RapidAPI Authentication

All requests require RapidAPI authentication headers:

- `X-RapidAPI-Key`: Your RapidAPI subscription key
- `X-RapidAPI-Host`: The API host provided by RapidAPI

---

## API 1: Phone Specs Explorer

**Host:** `phone-specs-explorer-api.p.rapidapi.com`

### Search Phones

**Endpoint:** `GET /{brand_id}/search`

Search for phones by query string.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `brand_id` | string | Path | Brand identifier |

**Headers:**

| Header | Value |
|--------|-------|
| `X-RapidAPI-Host` | `phone-specs-explorer-api.p.rapidapi.com` |

**JavaScript Example:**

```javascript
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://phone-specs-explorer-api.p.rapidapi.com/2165/search',
  params: { q: 'iPhone' },
  headers: {
    'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
    'x-rapidapi-host': 'phone-specs-explorer-api.p.rapidapi.com'
  }
};

async function fetchData() {
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

fetchData();
```

**Example Response:**

```json
{
  "status": 200,
  "success": true,
  "query": "iPhone",
  "data": [
    {
      "id": "prestigio_multiphone_5508_duo",
      "brand_name": "Prestigio",
      "phone_model": "MultiPhone 5508 Duo",
      "description": "Prestigio MultiPhone 5508 Duo Android smartphone. Announced 2014. Features 5.0\" display, MT6592 chipset, 13 MP primary camera, 5 MP front camera, 2300 mAh battery, 16 GB storage, 1000 MB RAM, Asahi Dragontrail Glass."
    }
  ]
}
```

---

## API 2: Mobile Phones2

**Host:** `mobile-phones2.p.rapidapi.com`

### List Brands

**Endpoint:** `GET /brands`

Retrieve a list of all available device manufacturers/brands.

**Parameters:** None required.

**Headers:**

| Header | Value |
|--------|-------|
| `X-RapidAPI-Host` | `mobile-phones2.p.rapidapi.com` |

**JavaScript Example:**

```javascript
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://mobile-phones2.p.rapidapi.com/brands',
  headers: {
    'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
    'x-rapidapi-host': 'mobile-phones2.p.rapidapi.com'
  }
};

async function fetchData() {
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

fetchData();
```

**Example Response:**

```json
[
  { "name": "Nokia", "id": 1 },
  { "name": "Ericsson", "id": 2 },
  { "name": "Siemens", "id": 3 },
  { "name": "Motorola", "id": 4 },
  { "name": "alcatel", "id": 5 },
  { "name": "Panasonic", "id": 6 },
  { "name": "Sony", "id": 7 },
  { "name": "Mitsubishi", "id": 8 }
]
```

---

## API 3: Generic Device Specs API

**Host:** `your-api-host.rapidapi.com`

### Get All Device Specifications

**Endpoint:** `GET /api/values/getalldevicespecs`

Retrieve comprehensive specifications for all supported devices.

**JavaScript Example:**

```javascript
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'your-api-host.rapidapi.com'
  }
};

fetch('https://your-api-host.rapidapi.com/api/values/getalldevicespecs', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

**Python Example:**

```python
import requests

url = "https://your-api-host.rapidapi.com/api/values/getalldevicespecs"

headers = {
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "your-api-host.rapidapi.com"
}

response = requests.get(url, headers=headers)
print(response.json())
```

**C# Example:**

```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    private static readonly HttpClient client = new HttpClient();

    static async Task Main()
    {
        client.DefaultRequestHeaders.Add("X-RapidAPI-Key", "YOUR_RAPIDAPI_KEY");
        client.DefaultRequestHeaders.Add("X-RapidAPI-Host", "your-api-host.rapidapi.com");

        string response = await client.GetStringAsync("https://your-api-host.rapidapi.com/api/values/getalldevicespecs");
        Console.WriteLine(response);
    }
}
```

**Sample Response:**

```json
[
  {
    "id": 1,
    "manufacturer": "Samsung",
    "model": "Galaxy S21",
    "chipset": "Exynos 2100",
    "androidVersion": "11",
    "battery": "4000 mAh",
    "cpu": "Octa-core (1x2.9 GHz Cortex-X1 & 3x2.80 GHz Cortex-A78 & 4x2.2 GHz Cortex-A55)",
    "displayResolution": "1080 x 2400 pixels",
    "displaySize": "6.2 inches",
    "displayType": "Dynamic AMOLED 2X",
    "gpu": "Mali-G78 MP14",
    "internal": "128GB 8GB RAM, 256GB 8GB RAM",
    "mainCameraFeatures": "LED flash, auto-HDR, panorama",
    "mainCameraSpecs": "64 MP + 12 MP + 12 MP",
    "mainVideoSpecs": "4K@30/60fps, 1080p@30/60/240fps",
    "selfieCameraFeatures": "Dual video call, Auto-HDR",
    "selfieCameraSpecs": "10 MP",
    "selfieVideoSpecs": "4K@30/60fps, 1080p@30fps",
    "sensors": "Fingerprint, accelerometer, gyro, proximity, compass, barometer"
  }
]
```

### Get Device Specifications by Manufacturer/Model

**Endpoint:** `GET /api/values/getspecs/{manufacturer}/{model}`

Retrieve specifications for a specific device.

**JavaScript Example:**

```javascript
const manufacturer = "Samsung";
const model = "Galaxy S21";

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'your-api-host.rapidapi.com'
  }
};

fetch(`https://your-api-host.rapidapi.com/api/values/getspecs/${manufacturer}/${model}`, options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

**Python Example:**

```python
import requests

manufacturer = "Samsung"
model = "Galaxy S21"
url = f"https://your-api-host.rapidapi.com/api/values/getspecs/{manufacturer}/{model}"

headers = {
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
    "X-RapidAPI-Host": "your-api-host.rapidapi.com"
}

response = requests.get(url, headers=headers)
print(response.json())
```

### Get Devices by Brand

**Endpoint:** `GET /api/values/getdevices/{brand}`

Retrieve all devices from a specific manufacturer/brand.

**JavaScript Example:**

```javascript
const brand = 'Samsung';

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'your-api-host.rapidapi.com'
  }
};

fetch(`https://your-api-host.rapidapi.com/api/values/getdevices/${brand}`, options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

**Sample Response:**

```json
[
  {
    "id": 1,
    "manufacturer": "Samsung",
    "model": "Galaxy S21",
    "chipset": "Exynos 2100",
    "androidVersion": "11"
  },
  {
    "id": 2,
    "manufacturer": "Samsung",
    "model": "Galaxy Note 20",
    "chipset": "Exynos 990",
    "androidVersion": "10"
  }
]
```

### Get Devices by SoC (System on Chip)

**Endpoint:** `GET /api/values/devicesbysoc/{soc}`

Find all devices that use a specific chipset/SoC.

**JavaScript Example:**

```javascript
const soc = 'Snapdragon 888';

const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'your-api-host.rapidapi.com'
  }
};

fetch(`https://your-api-host.rapidapi.com/api/values/devicesbysoc/${encodeURIComponent(soc)}`, options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

### Get Available Brands

**Endpoint:** `GET /api/values/availablebrands`

Retrieve a list of all available device manufacturers/brands.

**Sample Response:**

```json
[
  "Samsung", "Apple", "OnePlus", "Xiaomi",
  "Google", "Huawei", "Oppo", "Vivo", "Realme", "Motorola"
]
```

---

## Response Format

All endpoints return JSON responses with appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
