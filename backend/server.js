import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = 3000;

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const hotelsFile = path.join(
  currentDirectory,
  'data',
  'hotels.json'
);

app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);

app.use(express.json());

async function readHotels() {
  const fileContent = await fs.readFile(
    hotelsFile,
    'utf8'
  );

  return JSON.parse(fileContent);
}

async function saveHotels(hotels) {
  await fs.writeFile(
    hotelsFile,
    JSON.stringify(hotels, null, 2),
    'utf8'
  );
}

/**
 * Return all available hotel cities.
 */
app.get('/api/cities', async (request, response) => {
  try {
    const hotels = await readHotels();

    const cities = [
      ...new Set(hotels.map((hotel) => hotel.city)),
    ].sort();

    response.json(cities);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: 'Cities could not be loaded.',
    });
  }
});

/**
 * Return every hotel or filter them by city.
 *
 * Examples:
 * /api/hotels
 * /api/hotels?city=Tirana
 */
app.get('/api/hotels', async (request, response) => {
  try {
    const hotels = await readHotels();

    const city =
      typeof request.query.city === 'string'
        ? request.query.city.trim().toLowerCase()
        : null;

    if (!city) {
      return response.json(hotels);
    }

    const filteredHotels = hotels.filter(
      (hotel) => hotel.city.toLowerCase() === city
    );

    response.json(filteredHotels);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: 'Hotels could not be loaded.',
    });
  }
});

/**
 * Return one hotel by ID.
 */
app.get('/api/hotels/:id', async (request, response) => {
  try {
    const hotels = await readHotels();
    const hotelId = Number(request.params.id);

    const hotel = hotels.find(
      (hotel) => hotel.id === hotelId
    );

    if (!hotel) {
      return response.status(404).json({
        message: 'Hotel not found.',
      });
    }

    response.json(hotel);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: 'Hotel could not be loaded.',
    });
  }
});

/**
 * Add a new hotel and save it in hotels.json.
 */
app.post('/api/hotels', async (request, response) => {
  try {
    const name = String(request.body.name ?? '').trim();
    const city = String(request.body.city ?? '').trim();
    const pricePerNight = Number(
      request.body.pricePerNight
    );

    const imageUrl = String(
      request.body.imageUrl ?? ''
    ).trim();

    if (
      !name ||
      !city ||
      !Number.isFinite(pricePerNight) ||
      pricePerNight <= 0
    ) {
      return response.status(400).json({
        message:
          'Name, city and a valid price are required.',
      });
    }

    const hotels = await readHotels();

    const nextId =
      hotels.length === 0
        ? 1
        : Math.max(...hotels.map((hotel) => hotel.id)) +
          1;

    const newHotel = {
      id: nextId,
      name,
      city,
      pricePerNight,
      imageUrl,
    };

    hotels.push(newHotel);

    await saveHotels(hotels);

    response.status(201).json(newHotel);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: 'Hotel could not be saved.',
    });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});