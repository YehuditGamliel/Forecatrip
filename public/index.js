let languages = [];
let currentDate = new Date();
let futureWeekDate = new Date(currentDate);
futureWeekDate.setDate(currentDate.getDate() + 7);
let futureWeekDateFormatted = futureWeekDate.toISOString().split('T')[0];
document.getElementById('date').setAttribute('min', currentDate.toISOString().split('T')[0]);
document.getElementById('date').setAttribute('max', futureWeekDateFormatted);


const participantsInput = document.getElementById('participants');
participantsInput.addEventListener('input', function() {
    participantsInput.value = participantsInput.value.replace(/[^A-Za-zא-ת\s]/g, '');
});


document.getElementById('myForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        const city = document.getElementById('place-picker').value;
        const date = document.getElementById('date').value;
        const participants = document.getElementById('participants').value;
        const displayName = city.displayName;
        try {
            const response = await fetch('/weatherInformation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ city: displayName, date: date, participants: participants }),
            });
            if (response.ok) {
                const result = await response.json();
                displayWeatherDetails(result);
            }

        } catch (err) {
            console.log("front", err)
        }
    } catch (err) {
        console.log("could not get info from page element: " + err);
    }

})

async function displayWeatherDetails(weatherData) {
    languages = [undefined, undefined]; // Reset languages array
    updateContent(weatherData, 'ltr', 'Details About The Activity', 'Suggested Activity', 'Suggested Attire', 'Suggested Food');
    document.getElementById('weather-container').style.display = 'block';
    document.getElementById('form').style.display = 'none';
    document.getElementById('return').style.display = 'flex';
}

function updateContent(data, direction, title, activityLabel, attireLabel, foodLabel) {
    document.getElementById('activity-suggestion').textContent = removeSingleAsterisk(data.activityDescription);
    document.getElementById('attire-suggestion').textContent = removeSingleAsterisk(data.attireDescription);
    document.getElementById('food-suggestion').textContent = removeSingleAsterisk(data.foodDescription);

    ['activity-suggestion', 'attire-suggestion', 'food-suggestion', 'title', 'Activity', 'Attire', 'Food'].forEach(id => {
        document.getElementById(id).style.direction = direction;
    });

    document.getElementById('title').textContent = title;
    document.getElementById('Activity').textContent = activityLabel;
    document.getElementById('Attire').textContent = attireLabel;
    document.getElementById('Food').textContent = foodLabel;
}

function removeSingleAsterisk(text) {
    if (text && text.includes('*')) {
        return text.replace(/\*/g, '');
    }
    return text;
}

function changeToEnglish() {
    if (languages[0]) {
        updateContent(languages[0], 'ltr', 'Details About The Activity', 'Suggested Activity', 'Suggested Attire', 'Suggested Food');
    }
}

async function changeToHebrew() {
    if (languages[1]) {
        updateContent(languages[1], 'rtl', 'פרטים על הפעילות', 'הצעת פעילות', 'הצעת לבוש', 'הצעת אוכל');
        return;
    }

    try {
        const activityDescription = document.getElementById('activity-suggestion').textContent;
        const attireDescription = document.getElementById('attire-suggestion').textContent;
        const foodDescription = document.getElementById('food-suggestion').textContent;

        languages[0] = { activityDescription, attireDescription, foodDescription }; // Save English data

        const response = await fetch('/changeToHebrew', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activityDescription, attireDescription, foodDescription }),
        });

        if (response.ok) {
            const result = await response.json();
            languages[1] = {
                activityDescription: removeSingleAsterisk(result.activityInHebrew),
                attireDescription: removeSingleAsterisk(result.attireInHebrew),
                foodDescription: removeSingleAsterisk(result.foodInHebrew),
            };
            updateContent(languages[1], 'rtl', 'פרטים על הפעילות', 'הצעת פעילות', 'הצעת לבוש', 'הצעת אוכל');
        } else {
            console.error('Failed to fetch Hebrew translation.');
        }
    } catch (err) {
        console.error("Error in Hebrew translation: " + err.message);
    }
}



function returnToForm() {
    document.getElementById('form').style.display = 'flex';
    document.getElementById('return').style.display = 'none';
    document.getElementById('weather-container').style.display = 'none';
}





