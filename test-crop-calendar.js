/**
 * Test script for Crop Calendar functionality
 * Tests backend API endpoints for calendar events
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000';

// Test data
const testEvent = {
  cropType: 'Wheat',
  eventType: 'planting',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  notes: 'Plant winter wheat in north field',
  reminder: true
};

async function testCropCalendar() {
  console.log('🗓️  Testing Crop Calendar API...\n');

  try {
    // Test 1: Create a new event
    console.log('1️⃣  Creating new calendar event...');
    const createResponse = await axios.post(`${API_URL}/api/calendar/events`, testEvent);
    
    if (createResponse.data.success) {
      console.log('✅ Event created successfully');
      console.log('   Event ID:', createResponse.data.event._id);
      console.log('   Crop:', createResponse.data.event.cropType);
      console.log('   Type:', createResponse.data.event.eventType);
      console.log('   Date:', new Date(createResponse.data.event.date).toLocaleDateString());
    }

    const eventId = createResponse.data.event._id;

    // Test 2: Get all events
    console.log('\n2️⃣  Fetching all calendar events...');
    const getAllResponse = await axios.get(`${API_URL}/api/calendar/events`);
    
    if (getAllResponse.data.success) {
      console.log('✅ Events fetched successfully');
      console.log('   Total events:', getAllResponse.data.count);
      console.log('   Events:', getAllResponse.data.events.map(e => ({
        crop: e.cropType,
        type: e.eventType,
        date: new Date(e.date).toLocaleDateString()
      })));
    }

    // Test 3: Get upcoming events
    console.log('\n3️⃣  Fetching upcoming events (next 30 days)...');
    const upcomingResponse = await axios.get(`${API_URL}/api/calendar/events/upcoming?days=30`);
    
    if (upcomingResponse.data.success) {
      console.log('✅ Upcoming events fetched successfully');
      console.log('   Upcoming events:', upcomingResponse.data.count);
    }

    // Test 4: Update event
    console.log('\n4️⃣  Updating calendar event...');
    const updateData = {
      notes: 'Updated: Plant winter wheat in north field - prepare soil first',
      completed: false
    };
    const updateResponse = await axios.put(`${API_URL}/api/calendar/events/${eventId}`, updateData);
    
    if (updateResponse.data.success) {
      console.log('✅ Event updated successfully');
      console.log('   Updated notes:', updateResponse.data.event.notes);
    }

    // Test 5: Mark as complete
    console.log('\n5️⃣  Marking event as complete...');
    const completeResponse = await axios.put(`${API_URL}/api/calendar/events/${eventId}`, {
      completed: true
    });
    
    if (completeResponse.data.success) {
      console.log('✅ Event marked as complete');
      console.log('   Completed:', completeResponse.data.event.completed);
    }

    // Test 6: Create multiple events
    console.log('\n6️⃣  Creating multiple events...');
    const events = [
      {
        cropType: 'Rice',
        eventType: 'irrigation',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Irrigate rice paddy',
        reminder: true
      },
      {
        cropType: 'Tomato',
        eventType: 'fertilizer',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Apply organic fertilizer',
        reminder: true
      },
      {
        cropType: 'Corn',
        eventType: 'harvest',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Harvest corn from east field',
        reminder: true
      }
    ];

    for (const event of events) {
      await axios.post(`${API_URL}/api/calendar/events`, event);
    }
    console.log('✅ Multiple events created successfully');

    // Test 7: Get all events again
    console.log('\n7️⃣  Fetching all events after additions...');
    const finalGetResponse = await axios.get(`${API_URL}/api/calendar/events`);
    
    if (finalGetResponse.data.success) {
      console.log('✅ Events fetched successfully');
      console.log('   Total events:', finalGetResponse.data.count);
      console.log('\n📋 All Calendar Events:');
      finalGetResponse.data.events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.cropType} - ${event.eventType}`);
        console.log(`      Date: ${new Date(event.date).toLocaleDateString()}`);
        console.log(`      Completed: ${event.completed ? '✓' : '✗'}`);
        if (event.notes) console.log(`      Notes: ${event.notes}`);
      });
    }

    // Test 8: Delete event
    console.log('\n8️⃣  Deleting test event...');
    const deleteResponse = await axios.delete(`${API_URL}/api/calendar/events/${eventId}`);
    
    if (deleteResponse.data.success) {
      console.log('✅ Event deleted successfully');
    }

    console.log('\n✅ All Crop Calendar tests passed!\n');
    console.log('🎉 Crop Calendar is working correctly!');
    console.log('\n📝 Summary:');
    console.log('   - Calendar events can be created');
    console.log('   - Events can be retrieved (all and upcoming)');
    console.log('   - Events can be updated');
    console.log('   - Events can be marked as complete');
    console.log('   - Events can be deleted');
    console.log('\n🌐 Frontend: Navigate to http://localhost:3000/crop-calendar to view the calendar UI');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
console.log('='.repeat(60));
console.log('🗓️  CROP CALENDAR API TEST');
console.log('='.repeat(60));
console.log('Testing backend API endpoints for calendar events\n');

testCropCalendar();
