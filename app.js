
const { GoogleGenerativeAI } = require("@google/generative-ai");

const express = require('express');
const app = express();
app.use(express.static('public')); // Static files
app.use(express.json()); // Parse JSON bodies

const genAI = new GoogleGenerativeAI("AIzaSyBhdS7PaR1W2-Gh5Fxw6kFlDdk7mR18U9s");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

app.post('/weatherInformation', async (req, res) => {
  const city = req.body.city;
  const date = req.body.date;
  const participants = req.body.participants;
  const encodedDate = encodeURIComponent(date);
  try {
    const data = await ApiOpenWeatherMap(city, encodedDate, participants);
    res.json({
      message: 'Text content processed successfully',
      weatherDescription: data.weatherDescription,
      activityDescription: data.activityDescription,
      attireDescription: data.attireDescription,
      foodDescription: data.foodDescription
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred: ' + err });
  }
});

app.post('/changeToHebrew', async (req, res) => {
  const activity = req.body.activityDescription;
  const attire = req.body.attireDescription;
  const food = req.body.foodDescription;

  const prompt = `Translate the text into Hebrew. Just give me the request I asked without explanation.`;
  try {
    const activityResult = await model.generateContent([prompt, activity]);
    const attireResult = await model.generateContent([prompt, attire]);
    const foodResult = await model.generateContent([prompt, food]);
    const activityInHebrew = activityResult.response.text();
    const attireInHebrew = attireResult.response.text();
    const foodInHebrew = foodResult.response.text();
    res.json({
      message: 'Text content processed successfully',
      activityInHebrew: activityInHebrew,
      attireInHebrew: attireInHebrew,
      foodInHebrew: foodInHebrew
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
})

async function ApiOpenWeatherMap(city, encodedDate, participants) {
  const apiKey = '47cf17bf5436c96cc348ca661803d608';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&dt=${encodedDate}&appid=${apiKey}`;
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const weatherDescription = await response.json();
    const jsonString = JSON.stringify(weatherDescription);
    const result = await ideaForActivity(jsonString, participants, city, encodedDate);
    return {
      weatherDescription: weatherDescription,
      activityDescription: result.activityDescription,
      attireDescription: result.attireDescription,
      foodDescription: result.foodDescription
    };
  } catch (error) {
    throw new Error(error.message);
  }
}


async function ideaForActivity(weather, participants, city, date) {

  const promptOfActivity = `Give me an original idea for an activity for ${participants} in ${city} on ${date}
                            according to the weather conditions, show the weather in degrees. (up to eight sentences).`;
  const promptOfAttire = `Recommend me what to wear according to the weather on ${date}, without display the weather.`
  const promptOfFood = 'Give me an idea for food that suits the weather and the activity, without display the weather (up to eight sentences).';

  const activityDescription = await model.generateContent([promptOfActivity, weather]);
  const attireDescription = await model.generateContent([promptOfAttire, weather]);
  const foodDescription = await model.generateContent([promptOfFood, weather, activityDescription.response.text()]);

  const activityText = activityDescription.response.text();
  const attireText = attireDescription.response.text();
  const foodText = foodDescription.response.text();
  return {
    activityDescription: activityText,
    attireDescription: attireText,
    foodDescription: foodText
  };
}


// הפעלת השרת
app.listen(3001, () => {
  console.log('My app is listening on port 3001!');
});


