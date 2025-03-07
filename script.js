// DOM elements
const appointmentForm = document.getElementById('appointmentForm');
const formCard = document.getElementById('formCard');
const availableSlotsCard = document.getElementById('availableSlotsCard');
const availableSlotsContainer = document.getElementById('availableSlotsContainer');
const slotsLoadingMessage = document.getElementById('slotsLoadingMessage');
const confirmAppointmentBtn = document.getElementById('confirmAppointment');
const confirmationMessage = document.getElementById('confirmationMessage');
const confirmationDetails = document.getElementById('confirmationDetails');
const backToFormBtn = document.getElementById('backToForm');
const newAppointmentBtn = document.getElementById('newAppointment');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');

// State variables
let selectedDate = null;
let selectedTimeSlot = null;
let userDetails = {};
let availableDates = [];

// Update current time
function updateCurrentTime() {
    const now = new Date();

    // Format the time with hours, minutes, seconds and AM/PM
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12;

    // Add leading zeros
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    // Include date information
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);

    // Update the display
    currentTimeDisplay.textContent = `${dateStr}, ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
}

// Update time every second
setInterval(updateCurrentTime, 1000);

// Initial time update
updateCurrentTime();

// Generate available dates for next 14 days
const generateAvailableDates = () => {
    const dates = [];
    const now = new Date();

    // Generate dates for next 14 days
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);

        // Only include weekdays (Monday to Friday)
        const dayOfWeek = date.getDay();
        if (dayOfWeek > 0 && dayOfWeek <= 6) {
            dates.push({
                date: new Date(date),
                availableSlots: generateTimeSlots(date)
            });
        }
    }

    return dates;
};

// Generate time slots for a given date
const generateTimeSlots = (date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Base time slots
    const allTimeSlots = [
        "9:00 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "12:00",
        "2:00 PM", "2:30 PM", "3:00 PM", "4:00 PM"
    ];

    // If the selected date is today, filter out past time slots
    if (isToday) {
        return allTimeSlots.filter(slot => {
            const [time, period] = slot.split(' ');
            let [hour, minute] = time.split(':').map(Number);

            // Convert to 24-hour format for comparison
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            // If the hour is earlier than current hour, filter out
            if (hour < currentHour) return false;

            // If the hour is the same as current hour, check minutes
            if (hour === currentHour && minute <= currentMinute) return false;

            // Add a buffer of 30 minutes (can't book less than 30 min in advance)
            const bookingTime = new Date();
            bookingTime.setHours(currentHour);
            bookingTime.setMinutes(currentMinute + 30);

            const slotTime = new Date();
            slotTime.setHours(hour);
            slotTime.setMinutes(minute);

            return slotTime > bookingTime;
        });
    }

    // For future dates, simulate some randomness in availability
    return allTimeSlots.filter(() => Math.random() > 0.7); // Approximately 70% of slots are available
};

// Display available slots
const displayAvailableSlots = () => {
    // Clear previous content
    availableSlotsContainer.innerHTML = '';

    // Generate available dates and slots
    availableDates = generateAvailableDates();

    if (availableDates.length === 0) {
        availableSlotsContainer.innerHTML = '<p>No available appointments in the next 14 days. Please try again later.</p>';
        return;
    }

    // Create elements for each available date
    availableDates.forEach(dateInfo => {
        if (dateInfo.availableSlots.length === 0) return; // Skip dates with no available slots

        const dateSlot = document.createElement('div');
        dateSlot.className = 'date-slot';
        dateSlot.setAttribute('data-date', dateInfo.date.toISOString());

        // Format the date
        const formattedDate = dateInfo.date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        dateSlot.innerHTML = `
            <div class="date-header">
                <span class="date-day">${formattedDate}</span>
                <span class="available-count">${dateInfo.availableSlots.length} slots</span>
            </div>
            <div class="time-options">
                ${dateInfo.availableSlots.map(time =>
            `<span class="time-option" data-time="${time}">${time}</span>`
        ).join('')}
            </div>
        `;

        availableSlotsContainer.appendChild(dateSlot);
    });

    // Add event listeners to time options
    const timeOptions = document.querySelectorAll('.time-option');
    timeOptions.forEach(option => {
        option.addEventListener('click', event => {
            // Deselect any previously selected time
            document.querySelectorAll('.time-option.selected').forEach(el => {
                el.classList.remove('selected');
            });

            // Select the clicked time
            event.target.classList.add('selected');

            // Get the selected date from the parent date-slot
            const parentDateSlot = event.target.closest('.date-slot');
            selectedDate = new Date(parentDateSlot.getAttribute('data-date'));

            // Get the selected time
            selectedTimeSlot = event.target.getAttribute('data-time');

            // Show confirm button
            confirmAppointmentBtn.classList.remove('hidden');
        });
    });
};

// Confirm appointment
const confirmAppointment = () => {
    if (!selectedDate || !selectedTimeSlot) {
        alert('Please select a date and time for your appointment.');
        return;
    }

    // In a real application, you would send this data to a server
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get the current time to add to confirmation
    const now = new Date();
    const bookingTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });

    // Display confirmation message
    confirmationDetails.innerHTML = `
        <strong>${userDetails.name}</strong>, your appointment has been scheduled for
        <strong>${formattedDate}</strong> at <strong>${selectedTimeSlot}</strong> for
        <strong>${getServiceName(userDetails.service)}</strong>.<br>
        <span style="font-size: 0.9rem; margin-top: 0.5rem; display: block;">
            Booked on ${now.toLocaleDateString()} at ${bookingTime}
        </span>
        A confirmation email has been sent to ${userDetails.email}.
    `;

    // Hide slots and show confirmation
    availableSlotsContainer.classList.add('hidden');
    confirmAppointmentBtn.classList.add('hidden');
    confirmationMessage.classList.remove('hidden');
};

// Get service name based on service value
const getServiceName = (serviceValue) => {
    const services = {
        'consultation': 'Initial Consultation',
        'followup': 'Follow-up Appointment',
        'checkup': 'Regular Check-up',
        'emergency': 'Emergency Service'
    };

    return services[serviceValue] || serviceValue;
};

// Event listeners
appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(appointmentForm);
    userDetails = Object.fromEntries(formData.entries());

    // Show available slots card
    formCard.classList.add('hidden');
    availableSlotsCard.classList.remove('hidden');

    // Display available slots
    displayAvailableSlots();
});

backToFormBtn.addEventListener('click', () => {
    // Show form card
    availableSlotsCard.classList.add('hidden');
    formCard.classList.remove('hidden');

    // Reset selections
    selectedDate = null;
    selectedTimeSlot = null;
    confirmAppointmentBtn.classList.add('hidden');
    confirmationMessage.classList.add('hidden');
    availableSlotsContainer.classList.remove('hidden');
});

confirmAppointmentBtn.addEventListener('click', confirmAppointment);

newAppointmentBtn.addEventListener('click', () => {
    // Reset form
    appointmentForm.reset();

    // Reset selections
    selectedDate = null;
    selectedTimeSlot = null;

    // Hide confirmation message
    confirmationMessage.classList.add('hidden');
    availableSlotsContainer.classList.remove('hidden');

    // Show form card
    availableSlotsCard.classList.add('hidden');
    formCard.classList.remove('hidden');
});
